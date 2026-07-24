<?php

namespace App\Enums;

enum StatusDokumen: string
{
    case Ada = 'ada';
    case Belum = 'belum';

    /**
     * Label siap tampil untuk antarmuka berbahasa Indonesia.
     */
    public function label(): string
    {
        return match ($this) {
            self::Ada => 'Ada',
            self::Belum => 'Belum',
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
