<?php

namespace Database\Seeders;

use App\Enums\StatusPaket;
use App\Models\ChecklistDokumen;
use App\Models\Paket;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        $this->call(ChecklistDokumenSeeder::class);

        // Sebaran status dibuat eksplisit agar kartu statistik dashboard dan
        // mode audit langsung punya data yang bisa dilihat setelah seeding.
        $pakets = [
            ...Paket::factory()->count(12)->aktif()->create(),
            ...Paket::factory()->count(6)->selesai()->create(),
            ...Paket::factory()->count(4)->menungguAudit()->create(),
        ];

        $this->seedDokumenPaket($pakets);
    }

    /**
     * Isi realisasi checklist_dokumen untuk tiap paket. Probabilitas "ada"
     * dihitung per tahap, bukan satu batas linear di seluruh 28 item: dokumen
     * administrasi (persiapan, perencanaan, pengadaan) lazimnya tuntas jauh
     * sebelum fisik berjalan jauh, sedangkan dokumen pelaksanaan & pasca
     * konstruksi baru terisi seiring progres fisik mendekati selesai — pola
     * ini yang bikin contoh di dashboard masuk akal (bukan tangga acak murni).
     *
     * @param  list<Paket>  $pakets
     */
    private function seedDokumenPaket(array $pakets): void
    {
        $items = ChecklistDokumen::query()->orderBy('urutan')->get();

        if ($items->isEmpty()) {
            return;
        }

        $rows = [];
        $now = now();

        foreach ($pakets as $paket) {
            // Mayoritas paket dibuat rapi kelengkapan dokumennya; hanya
            // sebagian kecil (~1 dari 5) sengaja dibuat bolong, supaya daftar
            // "perlu ditindaklanjuti" berisi segelintir paket yang benar-benar
            // perlu perhatian — bukan hampir semua paket.
            $rapi = fake()->boolean(80);
            $tuntas = $paket->status !== StatusPaket::Aktif; // Selesai / Menunggu Audit

            foreach ($items as $item) {
                $peluangAda = match ($item->tahap) {
                    // Admin (persiapan, perencanaan, pengadaan): selesai lebih
                    // dulu, hampir tidak bergantung pada progres fisik — kecuali
                    // paket baru saja mulai (progres sangat rendah).
                    'Persiapan & anggaran', 'Perencanaan teknis' => $paket->progres >= 3 ? ($rapi ? 0.98 : 0.85) : 0.2,
                    'Pengadaan' => $paket->progres >= 3 ? ($rapi ? 0.95 : 0.75) : 0.15,
                    // Pelaksanaan: mengikuti progres fisik langsung.
                    'Pelaksanaan konstruksi' => $tuntas
                        ? ($rapi ? 0.95 : 0.8)
                        : min(0.95, $paket->progres / 85) * ($rapi ? 1 : 0.7),
                    // Pasca konstruksi: baru relevan mendekati/selesai PHO.
                    default => $tuntas
                        ? ($rapi ? 0.85 : 0.5)
                        : ($paket->progres >= 85 ? ($rapi ? 0.6 : 0.25) : 0.03),
                };

                $rows[] = [
                    'paket_id' => $paket->id,
                    'checklist_dokumen_id' => $item->id,
                    'status' => fake()->boolean((int) round($peluangAda * 100)) ? 'ada' : 'belum',
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        foreach (array_chunk($rows, 500) as $chunk) {
            DB::table('dokumen_paket')->insert($chunk);
        }
    }
}
