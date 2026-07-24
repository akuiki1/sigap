<?php

namespace App\Enums;

enum StatusPaket: string
{
    case Aktif = 'aktif';
    case Selesai = 'selesai';
    case MenungguAudit = 'menunggu_audit';

    /**
     * Label siap tampil untuk antarmuka berbahasa Indonesia.
     */
    public function label(): string
    {
        return match ($this) {
            self::Aktif => 'Aktif',
            self::Selesai => 'Selesai',
            self::MenungguAudit => 'Menunggu Audit',
        };
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
