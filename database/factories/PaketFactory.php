<?php

namespace Database\Factories;

use App\Enums\StatusPaket;
use App\Models\Paket;
use Illuminate\Database\Eloquent\Factories\Factory;

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
        $mulai = fake()->dateTimeBetween("{$tahun}-01-01", "{$tahun}-06-30");

        return [
            'kode_paket' => sprintf('CK-%d-%04d', $tahun, fake()->unique()->numberBetween(1, 9999)),
            'nama' => fake()->randomElement(static::$jenisPekerjaan).' '.fake()->randomElement(static::$wilayah),
            'lokasi' => 'Jl. '.fake()->lastName().' No. '.fake()->numberBetween(1, 120).', '.fake()->randomElement(static::$wilayah),
            'penyedia' => 'CV '.fake()->lastName().' '.fake()->randomElement(['Perkasa', 'Mandiri', 'Sejahtera', 'Utama']),
            // Kelipatan sejuta rupiah, rentang wajar untuk paket gedung daerah.
            'nilai_kontrak' => fake()->numberBetween(150, 25_000) * 1_000_000,
            'progres' => fake()->numberBetween(0, 100),
            'status' => fake()->randomElement(StatusPaket::cases()),
            'tahun_anggaran' => $tahun,
            'tanggal_mulai' => $mulai,
            'tanggal_selesai' => fake()->dateTimeBetween($mulai, "{$tahun}-12-31"),
            'keterangan' => fake()->optional()->sentence(),
        ];
    }

    /**
     * Paket yang masih berjalan.
     */
    public function aktif(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => StatusPaket::Aktif,
            'progres' => fake()->numberBetween(1, 99),
        ]);
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
