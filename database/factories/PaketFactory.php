<?php

namespace Database\Factories;

use App\Enums\StatusPaket;
use App\Models\Paket;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;

/**
 * @extends Factory<Paket>
 */
class PaketFactory extends Factory
{
    /**
     * Jenis pekerjaan yang lazim di Bidang Cipta Karya.
     *
     * @var list<string>
     */
    protected static array $jenisPekerjaan = [
        'Pembangunan Gedung Kantor',
        'Rehabilitasi Gedung Sekolah',
        'Renovasi Puskesmas',
        'Pembangunan Gedung Serbaguna',
        'Peningkatan Gedung Perpustakaan',
        'Rehabilitasi Balai Desa',
    ];

    /**
     * Faker berjalan pada locale en_US, jadi nama wilayah disediakan sendiri
     * agar data contoh masuk akal untuk konteks pemerintah daerah.
     *
     * @var list<string>
     */
    protected static array $wilayah = [
        'Kec. Sukajadi',
        'Kec. Cibeunying',
        'Kel. Sidomulyo',
        'Kec. Tanjungpinang Kota',
        'Kel. Harapan Jaya',
        'Kec. Medan Baru',
    ];

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $tahun = fake()->numberBetween(2023, 2026);
        $kontrak = fake()->dateTimeBetween("{$tahun}-01-15", "{$tahun}-02-15");
        $spmk = (clone $kontrak)->modify('+6 days');
        $mulai = $spmk;
        $mc0 = (clone $spmk)->modify('+12 days');
        $selesai = fake()->dateTimeBetween(
            (clone $mulai)->modify('+150 days'),
            (clone $mulai)->modify('+210 days'),
        );
        $nilaiKontrak = fake()->numberBetween(150, 25_000) * 1_000_000;

        return [
            'kode_paket' => sprintf('CK-%d-%04d', $tahun, fake()->unique()->numberBetween(1, 9999)),
            'nama' => fake()->randomElement(static::$jenisPekerjaan).' '.fake()->randomElement(static::$wilayah),
            'lokasi' => 'Jl. '.fake()->lastName().' No. '.fake()->numberBetween(1, 120).', '.fake()->randomElement(static::$wilayah),
            'penyedia' => 'CV '.fake()->lastName().' '.fake()->randomElement(['Perkasa', 'Mandiri', 'Sejahtera', 'Utama']),
            'sumber_dana' => fake()->randomElement(["DAU {$tahun}", "DAK Fisik {$tahun}", "APBD Kab. HST {$tahun}"]),
            // Kelipatan sejuta rupiah, rentang wajar untuk paket gedung daerah.
            'nilai_kontrak' => $nilaiKontrak,
            // Pagu (plafon RUP/DPA) sedikit di atas nilai kontrak hasil pengadaan.
            'pagu' => (int) round($nilaiKontrak * fake()->randomFloat(3, 1.01, 1.08)),
            'progres' => fake()->numberBetween(0, 100),
            'status' => fake()->randomElement(StatusPaket::cases()),
            'no_kontrak' => sprintf('602/%03d/CK/%d', fake()->numberBetween(1, 999), $tahun),
            'konsultan_pengawas' => 'CV '.fake()->lastName().' Banua',
            'ppk' => fake()->name(),
            'pptk' => fake()->name(),
            'tahun_anggaran' => $tahun,
            'tanggal_mulai' => $mulai,
            'tanggal_selesai' => $selesai,
            'tanggal_kontrak' => $kontrak,
            'tanggal_spmk' => $spmk,
            'tanggal_mc0' => $mc0,
            'tanggal_pho_rencana' => $selesai,
            'keterangan' => fake()->optional()->sentence(),
        ];
    }

    /**
     * Paket yang masih berjalan. Progres dikorelasikan dengan posisi hari ini
     * di antara SPMK–PHO rencana (± jitter), supaya deviasi realisasi vs
     * rencana di dashboard tidak melebar liar seperti angka acak murni.
     * Sebagian besar dibuat berjalan sesuai rencana (jitter kecil) dan hanya
     * sebagian kecil sengaja dibuat tertinggal jauh — mencerminkan kondisi
     * nyata "sebagian besar paket lancar, segelintir perlu perhatian".
     */
    public function aktif(): static
    {
        return $this->state(function (array $attributes) {
            $mulai = Carbon::instance($attributes['tanggal_spmk'] ?? $attributes['tanggal_mulai']);
            $selesai = Carbon::instance($attributes['tanggal_pho_rencana'] ?? $attributes['tanggal_selesai']);
            $totalHari = max(1, $mulai->diffInDays($selesai));
            $berjalanHari = $mulai->diffInDays(Carbon::now(), false);
            $rencanaPersen = max(0, min(100, ($berjalanHari / $totalHari) * 100));

            $jitter = fake()->boolean(25)
                ? fake()->numberBetween(-30, -14)
                : fake()->numberBetween(-6, 8);

            return [
                'status' => StatusPaket::Aktif,
                'progres' => max(1, min(99, (int) round($rencanaPersen + $jitter))),
            ];
        });
    }

    /**
     * Paket yang pekerjaannya sudah rampung.
     */
    public function selesai(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => StatusPaket::Selesai,
            'progres' => 100,
        ]);
    }

    /**
     * Paket yang menunggu peninjauan pada mode audit.
     */
    public function menungguAudit(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => StatusPaket::MenungguAudit,
            'progres' => 100,
        ]);
    }
}
