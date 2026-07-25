<?php

namespace App\Enums;

/**
 * Peran pengguna di lingkungan dinas. Satu pengguna memegang satu peran;
 * cukup untuk kebutuhan SIGAP tanpa perlu tabel izin granular / paket eksternal.
 * Aturan "siapa boleh apa" dijabarkan di App\Policies (lihat PaketPolicy).
 */
enum Role: string
{
    /** Kelola seluruh data, hapus paket, dan kelola akun pengguna. */
    case Admin = 'admin';

    /** Staf/PPTK: input & ubah paket, unggah berkas, catat progres. */
    case Operator = 'operator';

    /** PPK/konsultan pengawas: verifikasi berkas & progres yang dilaporkan. */
    case Pengawas = 'pengawas';

    /** Auditor/pemeriksa: hanya melihat, tidak mengubah apa pun. */
    case Auditor = 'auditor';

    /**
     * Label siap tampil untuk antarmuka berbahasa Indonesia.
     */
    public function label(): string
    {
        return match ($this) {
            self::Admin => 'Administrator',
            self::Operator => 'Operator',
            self::Pengawas => 'Pengawas',
            self::Auditor => 'Auditor',
        };
    }

    /**
     * Bisakah peran ini menginput/mengubah data (paket, berkas, progres)?
     */
    public function bisaInput(): bool
    {
        return in_array($this, [self::Admin, self::Operator], true);
    }

    /**
     * Bisakah peran ini memverifikasi berkas & progres yang dilaporkan?
     */
    public function bisaVerifikasi(): bool
    {
        return in_array($this, [self::Admin, self::Pengawas], true);
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
