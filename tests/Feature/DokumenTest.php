<?php

namespace Tests\Feature;

use App\Enums\Role;
use App\Enums\StatusDokumen;
use App\Enums\StatusVerifikasi;
use App\Models\Berkas;
use App\Models\ChecklistDokumen;
use App\Models\DokumenPaket;
use App\Models\Paket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class DokumenTest extends TestCase
{
    use RefreshDatabase;

    protected function checklistItem(string $tahap, string $nama, int $urutan = 1): ChecklistDokumen
    {
        return ChecklistDokumen::create([
            'tahap' => $tahap,
            'nama' => $nama,
            'urutan' => $urutan,
            'wajib' => true,
        ]);
    }

    protected function dokumen(Paket $paket, ChecklistDokumen $item, StatusDokumen $status): DokumenPaket
    {
        return DokumenPaket::create([
            'paket_id' => $paket->id,
            'checklist_dokumen_id' => $item->id,
            'status' => $status,
        ]);
    }

    public function test_guests_are_redirected_to_the_login_page(): void
    {
        $this->get(route('dokumen.index'))->assertRedirect(route('login'));
    }

    /**
     * Menelusuri dokumen adalah aksi baca, jadi terbuka untuk semua peran —
     * sejalan dengan PaketPolicy::view dan BerkasPolicy::download.
     */
    public function test_every_role_can_view_the_listing(): void
    {
        foreach (Role::cases() as $role) {
            $this->actingAs(User::factory()->role($role)->create());

            $this->get(route('dokumen.index'))
                ->assertOk()
                ->assertInertia(fn (AssertableInertia $page) => $page->component('dokumen/index'));
        }
    }

    public function test_page_renders_when_no_dokumen_exists(): void
    {
        $this->actingAs(User::factory()->create());

        $this->get(route('dokumen.index'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page->has('dokumen.data', 0));
    }

    public function test_listing_carries_paket_identity_for_each_row(): void
    {
        $this->actingAs(User::factory()->create());

        $paket = Paket::factory()->create();
        $item = $this->checklistItem('Pengadaan', 'Berita acara aanwijzing');
        $this->dokumen($paket, $item, StatusDokumen::Belum);

        $this->get(route('dokumen.index'))
            ->assertOk()
            ->assertInertia(
                fn (AssertableInertia $page) => $page
                    ->has('dokumen.data', 1)
                    ->where('dokumen.data.0.nama', 'Berita acara aanwijzing')
                    ->where('dokumen.data.0.tahap', 'Pengadaan')
                    ->where('dokumen.data.0.paket_id', $paket->id)
                    ->where('dokumen.data.0.paket_kode', $paket->kode_paket)
                    ->where('dokumen.data.0.berkas', null)
            );
    }

    public function test_it_filters_by_tahap(): void
    {
        $this->actingAs(User::factory()->create());

        $paket = Paket::factory()->create();
        $pengadaan = $this->checklistItem('Pengadaan', 'Dokumen kontrak', 1);
        $pelaksanaan = $this->checklistItem('Pelaksanaan konstruksi', 'As-built drawing', 2);

        $this->dokumen($paket, $pengadaan, StatusDokumen::Belum);
        $this->dokumen($paket, $pelaksanaan, StatusDokumen::Belum);

        $this->get(route('dokumen.index', ['tahap' => 'Pengadaan']))
            ->assertOk()
            ->assertInertia(
                fn (AssertableInertia $page) => $page
                    ->has('dokumen.data', 1)
                    ->where('dokumen.data.0.nama', 'Dokumen kontrak')
                    ->where('filters.tahap', 'Pengadaan')
            );
    }

    public function test_it_filters_by_status(): void
    {
        $this->actingAs(User::factory()->create());

        $paket = Paket::factory()->create();
        $ada = $this->checklistItem('Pengadaan', 'Dokumen kontrak', 1);
        $belum = $this->checklistItem('Pengadaan', 'Jaminan pelaksanaan', 2);

        $this->dokumen($paket, $ada, StatusDokumen::Ada);
        $this->dokumen($paket, $belum, StatusDokumen::Belum);

        $this->get(route('dokumen.index', ['status' => 'belum']))
            ->assertOk()
            ->assertInertia(
                fn (AssertableInertia $page) => $page
                    ->has('dokumen.data', 1)
                    ->where('dokumen.data.0.nama', 'Jaminan pelaksanaan')
            );
    }

    /**
     * Status verifikasi menempel di berkas terkini, bukan di dokumen_paket,
     * jadi item tanpa berkas memang harus tersaring keluar.
     */
    public function test_it_filters_by_verifikasi_of_the_current_berkas(): void
    {
        $pengunggah = User::factory()->operator()->create();
        $this->actingAs($pengunggah);

        $paket = Paket::factory()->create();
        $ditolak = $this->checklistItem('Pengadaan', 'Dokumen kontrak', 1);
        $tanpaBerkas = $this->checklistItem('Pengadaan', 'Jaminan pelaksanaan', 2);

        $dokumen = $this->dokumen($paket, $ditolak, StatusDokumen::Ada);
        $this->dokumen($paket, $tanpaBerkas, StatusDokumen::Belum);

        $dokumen->berkas()->create([
            'file_path' => 'berkas/kontrak.pdf',
            'nama_asli' => 'kontrak.pdf',
            'ukuran' => 2048,
            'mime_type' => 'application/pdf',
            'versi' => 1,
            'is_terkini' => true,
            'status_verifikasi' => StatusVerifikasi::Ditolak,
            'uploaded_by' => $pengunggah->id,
        ]);

        $this->get(route('dokumen.index', ['verifikasi' => 'ditolak']))
            ->assertOk()
            ->assertInertia(
                fn (AssertableInertia $page) => $page
                    ->has('dokumen.data', 1)
                    ->where('dokumen.data.0.nama', 'Dokumen kontrak')
                    ->where('dokumen.data.0.berkas.status_verifikasi', 'ditolak')
                    ->where('dokumen.data.0.berkas.diunggah_oleh', $pengunggah->name)
            );
    }

    /**
     * Versi lama tidak boleh ikut menentukan hasil filter verifikasi —
     * yang berlaku hanya berkas dengan is_terkini = true.
     */
    public function test_archived_berkas_versions_do_not_match_the_verifikasi_filter(): void
    {
        $pengunggah = User::factory()->operator()->create();
        $this->actingAs($pengunggah);

        $paket = Paket::factory()->create();
        $item = $this->checklistItem('Pengadaan', 'Dokumen kontrak');
        $dokumen = $this->dokumen($paket, $item, StatusDokumen::Ada);

        $dasar = [
            'file_path' => 'berkas/kontrak.pdf',
            'nama_asli' => 'kontrak.pdf',
            'ukuran' => 2048,
            'mime_type' => 'application/pdf',
            'uploaded_by' => $pengunggah->id,
        ];

        $dokumen->berkas()->create([...$dasar, 'versi' => 1, 'is_terkini' => false, 'status_verifikasi' => StatusVerifikasi::Ditolak]);
        $dokumen->berkas()->create([...$dasar, 'versi' => 2, 'is_terkini' => true, 'status_verifikasi' => StatusVerifikasi::Diverifikasi]);

        $this->get(route('dokumen.index', ['verifikasi' => 'ditolak']))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page->has('dokumen.data', 0));

        $this->get(route('dokumen.index', ['verifikasi' => 'diverifikasi']))
            ->assertOk()
            ->assertInertia(
                fn (AssertableInertia $page) => $page
                    ->has('dokumen.data', 1)
                    ->where('dokumen.data.0.berkas.versi', 2)
            );
    }

    public function test_it_filters_by_tahun_anggaran_and_search_query(): void
    {
        $this->actingAs(User::factory()->create());

        $lama = Paket::factory()->create(['tahun_anggaran' => 2024, 'nama' => 'Rehabilitasi Balai Desa Lama']);
        $baru = Paket::factory()->create(['tahun_anggaran' => 2026, 'nama' => 'Pembangunan Gedung Arsip']);
        $item = $this->checklistItem('Pengadaan', 'Dokumen kontrak');

        $this->dokumen($lama, $item, StatusDokumen::Belum);
        $this->dokumen($baru, $item, StatusDokumen::Belum);

        $this->get(route('dokumen.index', ['tahun' => 2026]))
            ->assertOk()
            ->assertInertia(
                fn (AssertableInertia $page) => $page
                    ->has('dokumen.data', 1)
                    ->where('dokumen.data.0.paket_id', $baru->id)
            );

        $this->get(route('dokumen.index', ['q' => 'Balai Desa']))
            ->assertOk()
            ->assertInertia(
                fn (AssertableInertia $page) => $page
                    ->has('dokumen.data', 1)
                    ->where('dokumen.data.0.paket_id', $lama->id)
            );
    }

    /**
     * Filter datang dari URL yang bisa disunting siapa saja; nilai asing
     * harus diperlakukan sebagai "tanpa filter", bukan 500 atau hasil kosong.
     */
    public function test_unknown_filter_values_are_ignored(): void
    {
        $this->actingAs(User::factory()->create());

        $paket = Paket::factory()->create();
        $item = $this->checklistItem('Pengadaan', 'Dokumen kontrak');
        $this->dokumen($paket, $item, StatusDokumen::Belum);

        $this->get(route('dokumen.index', ['status' => 'entah', 'tahap' => 'Tahap Palsu']))
            ->assertOk()
            ->assertInertia(
                fn (AssertableInertia $page) => $page
                    ->has('dokumen.data', 1)
                    ->where('filters.status', null)
                    ->where('filters.tahap', null)
            );
    }
}
