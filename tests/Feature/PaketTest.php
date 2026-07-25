<?php

namespace Tests\Feature;

use App\Enums\StatusPaket;
use App\Models\Paket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class PaketTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Payload valid untuk membuat paket baru.
     *
     * @return array<string, mixed>
     */
    protected function validPayload(array $overrides = []): array
    {
        return array_merge([
            'kode_paket' => 'CK-2026-0001',
            'nama' => 'Pembangunan Gedung Kantor Kec. Sukajadi',
            'lokasi' => 'Jl. Merdeka No. 10',
            'penyedia' => 'CV Karya Utama',
            'nilai_kontrak' => 2_500_000_000,
            'progres' => 25,
            'status' => StatusPaket::Aktif->value,
            'tahun_anggaran' => 2026,
            'tanggal_mulai' => '2026-02-01',
            'tanggal_selesai' => '2026-11-30',
            'keterangan' => 'Pekerjaan tahap pertama.',
        ], $overrides);
    }

    protected function actingAsUser(): User
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        return $user;
    }

    public function test_guests_are_redirected_to_the_login_page(): void
    {
        $this->get(route('paket.index'))->assertRedirect(route('login'));
    }

    public function test_index_lists_pakets(): void
    {
        $this->actingAsUser();
        $paket = Paket::factory()->aktif()->create(['nama' => 'Rehabilitasi Balai Desa']);

        $this->get(route('paket.index'))
            ->assertOk()
            ->assertInertia(
                fn (AssertableInertia $page) => $page
                    ->component('paket/index')
                    ->has('pakets.data', 1)
                    ->where('pakets.data.0.nama', $paket->nama)
            );
    }

    public function test_index_is_paginated_at_fifteen_per_page(): void
    {
        $this->actingAsUser();
        Paket::factory()->count(18)->create();

        $this->get(route('paket.index'))
            ->assertOk()
            ->assertInertia(
                fn (AssertableInertia $page) => $page
                    ->has('pakets.data', 15)
                    ->where('pakets.total', 18)
            );
    }

    public function test_create_form_can_be_rendered(): void
    {
        $this->actingAsUser();

        $this->get(route('paket.create'))
            ->assertOk()
            ->assertInertia(
                fn (AssertableInertia $page) => $page
                    ->component('paket/create')
                    ->has('statusOptions', 3)
            );
    }

    public function test_paket_can_be_created(): void
    {
        $this->actingAsUser();

        $response = $this->post(route('paket.store'), $this->validPayload());

        $paket = Paket::firstWhere('kode_paket', 'CK-2026-0001');

        $this->assertNotNull($paket);
        $response->assertRedirect(route('paket.show', $paket));

        $this->assertSame('Pembangunan Gedung Kantor Kec. Sukajadi', $paket->nama);
        $this->assertSame(2_500_000_000, $paket->nilai_kontrak);
        $this->assertSame(25, $paket->progres);
        $this->assertSame(StatusPaket::Aktif, $paket->status);
        $this->assertSame('2026-02-01', $paket->tanggal_mulai?->toDateString());
    }

    public function test_required_fields_are_validated(): void
    {
        $this->actingAsUser();

        $this->post(route('paket.store'), [])
            ->assertSessionHasErrors([
                'kode_paket',
                'nama',
                'nilai_kontrak',
                'progres',
                'status',
                'tahun_anggaran',
            ]);

        $this->assertSame(0, Paket::count());
    }

    public function test_kode_paket_must_be_unique(): void
    {
        $this->actingAsUser();
        Paket::factory()->create(['kode_paket' => 'CK-2026-0001']);

        $this->post(route('paket.store'), $this->validPayload())
            ->assertSessionHasErrors('kode_paket');

        $this->assertSame(1, Paket::count());
    }

    public function test_progres_must_be_between_zero_and_hundred(): void
    {
        $this->actingAsUser();

        $this->post(route('paket.store'), $this->validPayload(['progres' => 101]))
            ->assertSessionHasErrors('progres');

        $this->post(route('paket.store'), $this->validPayload(['progres' => -1]))
            ->assertSessionHasErrors('progres');
    }

    public function test_status_must_be_a_known_value(): void
    {
        $this->actingAsUser();

        $this->post(route('paket.store'), $this->validPayload(['status' => 'dibatalkan']))
            ->assertSessionHasErrors('status');
    }

    public function test_tanggal_selesai_cannot_precede_tanggal_mulai(): void
    {
        $this->actingAsUser();

        $this->post(route('paket.store'), $this->validPayload([
            'tanggal_mulai' => '2026-06-01',
            'tanggal_selesai' => '2026-05-31',
        ]))->assertSessionHasErrors('tanggal_selesai');
    }

    public function test_show_displays_the_paket(): void
    {
        $this->actingAsUser();
        $paket = Paket::factory()->menungguAudit()->create();

        $this->get(route('paket.show', $paket))
            ->assertOk()
            ->assertInertia(
                fn (AssertableInertia $page) => $page
                    ->component('paket/show')
                    ->where('paket.id', $paket->id)
                    ->where('statusLabel', 'Menunggu Audit')
            );
    }

    public function test_edit_form_can_be_rendered(): void
    {
        $this->actingAsUser();
        $paket = Paket::factory()->create();

        $this->get(route('paket.edit', $paket))
            ->assertOk()
            ->assertInertia(
                fn (AssertableInertia $page) => $page
                    ->component('paket/edit')
                    ->where('paket.id', $paket->id)
                    ->has('statusOptions', 3)
            );
    }

    public function test_paket_can_be_updated(): void
    {
        $this->actingAsUser();
        $paket = Paket::factory()->aktif()->create();

        $this->put(route('paket.update', $paket), $this->validPayload([
            'kode_paket' => $paket->kode_paket,
            'nama' => 'Nama Setelah Diperbarui',
            'progres' => 100,
            'status' => StatusPaket::Selesai->value,
        ]))->assertRedirect(route('paket.show', $paket));

        $paket->refresh();

        $this->assertSame('Nama Setelah Diperbarui', $paket->nama);
        $this->assertSame(100, $paket->progres);
        $this->assertSame(StatusPaket::Selesai, $paket->status);
    }

    public function test_update_allows_the_paket_to_keep_its_own_kode(): void
    {
        $this->actingAsUser();
        $paket = Paket::factory()->create(['kode_paket' => 'CK-2026-0777']);

        $this->put(route('paket.update', $paket), $this->validPayload([
            'kode_paket' => 'CK-2026-0777',
        ]))->assertSessionHasNoErrors();
    }

    public function test_update_rejects_a_kode_used_by_another_paket(): void
    {
        $this->actingAsUser();
        Paket::factory()->create(['kode_paket' => 'CK-2026-0001']);
        $paket = Paket::factory()->create(['kode_paket' => 'CK-2026-0002']);

        $this->put(route('paket.update', $paket), $this->validPayload([
            'kode_paket' => 'CK-2026-0001',
        ]))->assertSessionHasErrors('kode_paket');
    }

    public function test_paket_can_be_deleted(): void
    {
        // Hapus paket hanya boleh oleh admin.
        $this->actingAs(User::factory()->admin()->create());
        $paket = Paket::factory()->create();

        $this->delete(route('paket.destroy', $paket))
            ->assertRedirect(route('paket.index'));

        $this->assertSame(0, Paket::count());
    }

    public function test_auditor_cannot_create_update_or_delete_pakets(): void
    {
        $this->actingAs(User::factory()->auditor()->create());
        $paket = Paket::factory()->create();

        // Auditor hanya boleh melihat — semua aksi ubah ditolak 403.
        $this->get(route('paket.create'))->assertForbidden();
        $this->post(route('paket.store'), $this->validPayload())->assertForbidden();
        $this->get(route('paket.edit', $paket))->assertForbidden();
        $this->put(route('paket.update', $paket), $this->validPayload([
            'kode_paket' => $paket->kode_paket,
        ]))->assertForbidden();
        $this->delete(route('paket.destroy', $paket))->assertForbidden();

        // Auditor tetap boleh melihat daftar & detail.
        $this->get(route('paket.index'))->assertOk();
        $this->get(route('paket.show', $paket))->assertOk();
    }

    public function test_operator_can_input_but_cannot_delete_pakets(): void
    {
        $this->actingAs(User::factory()->operator()->create());
        $paket = Paket::factory()->create();

        $this->post(route('paket.store'), $this->validPayload())->assertRedirect();
        $this->delete(route('paket.destroy', $paket))->assertForbidden();
    }

    public function test_pengawas_cannot_input_pakets(): void
    {
        $this->actingAs(User::factory()->pengawas()->create());

        // Pengawas memverifikasi, bukan menginput — pembuatan paket ditolak.
        $this->get(route('paket.create'))->assertForbidden();
        $this->post(route('paket.store'), $this->validPayload())->assertForbidden();
    }
}
