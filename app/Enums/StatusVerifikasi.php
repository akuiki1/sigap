<?php

namespace App\Enums;

/**
 * Status pemeriksaan satu berkas oleh pengawas/PPK. Terpisah dari
 * App\Enums\StatusDokumen (ada/belum): status itu menandai kelengkapan
 * checklist ("apakah dokumennya ada"), sedangkan ini menandai keabsahannya
 * ("apakah dokumen yang diunggah sudah benar/disetujui").
 */
enum StatusVerifikasi: string
{
    case Diajukan = 'diajukan';
    case Diverifikasi = 'diverifikasi';
    case Ditolak = 'ditolak';

    /**
     * Label siap tampil untuk antarmuka berbahasa Indonesia.
     */
    public function label(): string
    {
        return match ($this) {
            self::Diajukan => 'Menunggu verifikasi',
            self::Diverifikasi => 'Terverifikasi',
            self::Ditolak => 'Ditolak',
        };
    }

    /**
     * Daftar nilai untuk aturan validasi.
     *
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
