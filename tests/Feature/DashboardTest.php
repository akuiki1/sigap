<?php

namespace Tests\Feature;

use App\Enums\StatusDokumen;
use App\Models\Berkas;
use App\Models\ChecklistDokumen;
use App\Models\DokumenPaket;
use App\Models\Paket;
use App\Models\ProgresPaket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_the_login_page()
    {
        $response = $this->get(route('dashboard'));
        $response->assertRedirect(route('login'));
    }

    public function test_authenticated_users_can_visit_the_dashboard()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $response = $this->get(route('dashboard'));
        $response->assertOk();
    }

    public function test_statistics_count_pakets_per_status(): void
    {
        $this->actingAs(User::factory()->create());

        // Tahun dipatok: statistik kini ikut tahun anggaran yang dipilih, dan
        // factory-nya mengacak tahun antara 2023–2026.
        $tahunIni = ['tahun_anggaran' => Carbon::now()->year];

        Paket::factory()->count(3)->aktif()->create($tahunIni);
        Paket::factory()->count(2)->selesai()->create($tahunIni);
        Paket::factory()->count(1)->menungguAudit()->create($tahunIni);

        $this->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(
                fn (AssertableInertia $page) => $page
                    ->component('dashboard')
                    ->where('stats.paket_aktif', 3)
            );
    }

    public function test_statistics_are_zero_when_there_are_no_pakets(): void
    {
        $this->actingAs(User::factory()->create());

        $this->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(
                fn (AssertableInertia $page) => $page
                    ->where('stats.paket_aktif', 0)
                    ->where('stats.menuju_pho', 0)
                    ->has('packages', 0)
            );
    }

    public function test_packages_list_defaults_to_the_current_tahun_anggaran(): void
    {
        $this->actingAs(User::factory()->create());

        $tahunIni = Carbon::now()->year;

        Paket::factory()->count(2)->create(['tahun_anggaran' => $tahunIni]);
        Paket::factory()->create(['tahun_anggaran' => $tahunIni - 1]);

        $this->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(
                fn (AssertableInertia $page) => $page
                    ->has('packages', 2)
                    ->where('tahunDipilih', $tahunIni)
                    ->where('tahunTersedia', [$tahunIni, $tahunIni - 1])
            );
    }

    public function test_tahun_anggaran_lampau_dapat_dipilih_lewat_query_string(): void
    {
        $this->actingAs(User::factory()->create());

        $tahunIni = Carbon::now()->year;

        Paket::factory()->count(2)->create(['tahun_anggaran' => $tahunIni]);
        Paket::factory()->aktif()->create(['tahun_anggaran' => $tahunIni - 1]);

        $this->get(route('dashboard', ['tahun' => $tahunIni - 1]))
            ->assertOk()
            ->assertInertia(
                fn (AssertableInertia $page) => $page
                    ->has('packages', 1)
                    ->where('tahunDipilih', $tahunIni - 1)
                    // Statistik ikut tahun yang dipilih, bukan menjumlahkan
                    // semua tahun — kalau tidak, angkanya tidak cocok dengan
                    // kartu di bawahnya.
                    ->where('stats.paket_aktif', 1)
            );
    }

    public function test_tahun_tanpa_paket_jatuh_kembali_ke_tahun_berjalan(): void
    {
        $this->actingAs(User::factory()->create());

        $tahunIni = Carbon::now()->year;

        Paket::factory()->create(['tahun_anggaran' => $tahunIni]);

        $this->get(route('dashboard', ['tahun' => 1999]))
            ->assertOk()
            ->assertInertia(
                fn (AssertableInertia $page) => $page
                    ->where('tahunDipilih', $tahunIni)
                    ->has('packages', 1)
            );
    }

    public function test_tahun_berjalan_selalu_tersedia_walau_belum_ada_paket(): void
    {
        $this->actingAs(User::factory()->create());

        $this->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(
                fn (AssertableInertia $page) => $page
                    ->where('tahunTersedia', [Carbon::now()->year])
            );
    }

    public function test_kartu_menyorot_dokumen_wajib_yang_belum_diunggah(): void
    {
        $this->actingAs(User::factory()->create());

        // Tanggal & progres dipatok supaya paketnya tepat sesuai rencana:
        // deviasi negatif akan mengalahkan sorot dokumen, dan state aktif()
        // sengaja mengacak sebagian paket jadi tertinggal.
        $paket = Paket::factory()->aktif()->create([
            'tahun_anggaran' => Carbon::now()->year,
            'tanggal_spmk' => Carbon::now()->subDays(10),
            'tanggal_pho_rencana' => Carbon::now()->addDays(90),
            'progres' => 10,
        ]);

        $item = ChecklistDokumen::create([
            'tahap' => 'persiapan',
            'nama' => 'Jaminan pelaksanaan',
            'urutan' => 1,
            'wajib' => true,
        ]);

        DokumenPaket::create([
            'paket_id' => $paket->id,
            'checklist_dokumen_id' => $item->id,
            'status' => StatusDokumen::Belum,
        ]);

        $this->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(
                fn (AssertableInertia $page) => $page
                    // Satu dokumen wajib yang kosong disebut namanya; lebih
                    // dari satu baru dihitung jumlahnya.
                    ->where('packages.0.sorot.teks', 'Jaminan pelaksanaan')
                    ->where('packages.0.sorot.tone', 'warn')
            );
    }

    public function test_kartu_paket_tanpa_temuan_tidak_punya_sorot(): void
    {
        $this->actingAs(User::factory()->create());

        Paket::factory()->selesai()->create([
            'tahun_anggaran' => Carbon::now()->year,
        ]);

        $this->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(
                fn (AssertableInertia $page) => $page
                    ->where('packages.0.sorot', null)
                    ->where('packages.0.foto', null)
            );
    }

    public function test_kartu_memakai_foto_progres_terbaru_sebagai_sampul(): void
    {
        $this->actingAs(User::factory()->create());

        $paket = Paket::factory()->create(['tahun_anggaran' => Carbon::now()->year]);
        $pelapor = User::factory()->operator()->create();

        $lama = $paket->progresPaket()->create([
            'tanggal' => '2026-06-30',
            'persentase' => 20,
            'dilaporkan_by' => $pelapor->id,
        ]);
        $baru = $paket->progresPaket()->create([
            'tanggal' => '2026-08-06',
            'persentase' => 62,
            'dilaporkan_by' => $pelapor->id,
        ]);

        $this->berkasFoto($lama, 'lama.jpg');
        $fotoBaru = $this->berkasFoto($baru, 'baru.jpg');

        $this->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(
                fn (AssertableInertia $page) => $page
                    ->where('packages.0.foto.id', $fotoBaru->id)
                    ->where('packages.0.foto.tanggal_label', '06 Agt')
            );
    }

    private function berkasFoto(ProgresPaket $progres, string $nama): Berkas
    {
        return $progres->foto()->create([
            'nama_asli' => $nama,
            'file_path' => "progres/{$nama}",
            'mime_type' => 'image/jpeg',
            'ukuran' => 1024,
            'uploaded_by' => $progres->dilaporkan_by,
        ]);
    }
}
