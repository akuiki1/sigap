<?php

namespace Database\Seeders;

use App\Models\ChecklistDokumen;
use Illuminate\Database\Seeder;

class ChecklistDokumenSeeder extends Seeder
{
    /**
     * Master checklist dokumen per tahap, acuan Permen PUPR 22/2018 (tahapan
     * pembangunan bangunan gedung negara) dan fokus pemeriksaan Perka BPKP
     * 3/2019. Tandai `wajib` hanya untuk dokumen yang ketidakhadirannya
     * langsung menggagalkan kesiapan audit; sisanya tetap dilacak tapi tidak
     * memblokir status "siap audit" bila belum ada (mis. jaminan uang muka,
     * yang hanya relevan bila paket mengambil uang muka).
     *
     * @var list<array{tahap: string, nama: string, wajib?: bool}>
     */
    private const array ITEMS = [
        ['tahap' => 'Persiapan & anggaran', 'nama' => 'DPA / DIPA'],
        ['tahap' => 'Persiapan & anggaran', 'nama' => 'RUP — Rencana Umum Pengadaan'],
        ['tahap' => 'Persiapan & anggaran', 'nama' => 'KAK — Kerangka Acuan Kerja'],
        ['tahap' => 'Persiapan & anggaran', 'nama' => 'SK PA/KPA, PPK, PPTK'],

        ['tahap' => 'Perencanaan teknis', 'nama' => 'Gambar DED'],
        ['tahap' => 'Perencanaan teknis', 'nama' => 'Spesifikasi teknis'],
        ['tahap' => 'Perencanaan teknis', 'nama' => 'RKS — Rencana Kerja & Syarat'],
        ['tahap' => 'Perencanaan teknis', 'nama' => 'RAB / Engineer\'s Estimate'],
        ['tahap' => 'Perencanaan teknis', 'nama' => 'Laporan konsultan perencana'],
        ['tahap' => 'Perencanaan teknis', 'nama' => 'Pengajuan PBG'],

        ['tahap' => 'Pengadaan', 'nama' => 'HPS — Harga Perkiraan Sendiri'],
        ['tahap' => 'Pengadaan', 'nama' => 'Dokumen pemilihan penyedia'],
        ['tahap' => 'Pengadaan', 'nama' => 'BAHP — Berita Acara Hasil Pemilihan'],
        ['tahap' => 'Pengadaan', 'nama' => 'SPPBJ'],
        ['tahap' => 'Pengadaan', 'nama' => 'Surat perjanjian / kontrak + lampiran'],
        ['tahap' => 'Pengadaan', 'nama' => 'Jaminan pelaksanaan', 'wajib' => true],
        ['tahap' => 'Pengadaan', 'nama' => 'Jaminan uang muka'],

        ['tahap' => 'Pelaksanaan konstruksi', 'nama' => 'PCM / Kick-off Meeting'],
        ['tahap' => 'Pelaksanaan konstruksi', 'nama' => 'Laporan harian, mingguan, bulanan'],
        ['tahap' => 'Pelaksanaan konstruksi', 'nama' => 'MC-0 — Mutual Check Nol'],
        ['tahap' => 'Pelaksanaan konstruksi', 'nama' => 'Dokumentasi foto 0 / 25 / 50%'],
        ['tahap' => 'Pelaksanaan konstruksi', 'nama' => 'CCO / adendum kontrak'],
        ['tahap' => 'Pelaksanaan konstruksi', 'nama' => 'As-built drawing', 'wajib' => true],
        ['tahap' => 'Pelaksanaan konstruksi', 'nama' => 'BA Serah Terima Pertama (PHO)', 'wajib' => true],
        ['tahap' => 'Pelaksanaan konstruksi', 'nama' => 'Final quantity / laporan akhir'],

        ['tahap' => 'Pasca konstruksi', 'nama' => 'Jaminan pemeliharaan', 'wajib' => true],
        ['tahap' => 'Pasca konstruksi', 'nama' => 'SLF — Sertifikat Laik Fungsi', 'wajib' => true],
        ['tahap' => 'Pasca konstruksi', 'nama' => 'Pendaftaran aset daerah (SIMBADA)'],
    ];

    /**
     * Seed the checklist_dokumen master table.
     */
    public function run(): void
    {
        if (ChecklistDokumen::query()->exists()) {
            return;
        }

        foreach (self::ITEMS as $urutan => $item) {
            ChecklistDokumen::query()->create([
                'tahap' => $item['tahap'],
                'nama' => $item['nama'],
                'urutan' => $urutan,
                'wajib' => $item['wajib'] ?? false,
            ]);
        }
    }
}
