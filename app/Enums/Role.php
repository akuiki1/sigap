<?php

namespace App\Enums;

/**
 * Peran pengguna di lingkungan dinas. Satu pengguna memegang satu peran;
 * cukup untuk kebutuhan SIGAP tanpa perlu tabel izin granular / paket eksternal.
 *
 * Hanya dua peran, dan bedanya cuma satu: admin boleh mengelola akun pengguna.
 * Seluruh data paket — input, unggah, verifikasi, sampai hapus — terbuka untuk
 * keduanya. Peran pengawas & auditor pernah ada tapi tidak pernah dipakai di
 * dinas: yang menginput dan yang memverifikasi ternyata orang yang sama.
 */
enum Role: string
{
    /** Kelola seluruh data paket, plus kelola akun pengguna. */
    case Admin = 'admin';

    /** Staf/PPTK: kelola seluruh data paket, tanpa akses kelola akun. */
    case Operator = 'operator';

    /**
     * Label siap tampil untuk antarmuka berbahasa Indonesia.
     */
    public function label(): string
    {
        return match ($this) {
            self::Admin => 'Administrator',
            self::Operator => 'Operator',
        };
    }

    /**
     * Bisakah peran ini membuat, mengubah peran, dan menghapus akun pengguna?
     * Satu-satunya kewenangan yang membedakan admin dari operator.
     */
    public function bisaKelolaUser(): bool
    {
        return $this === self::Admin;
    }

    /**
     * Daftar nilai untuk aturan validasi dan pilihan form.
     *
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
