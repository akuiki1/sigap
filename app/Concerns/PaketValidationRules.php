<?php

namespace App\Concerns;

use App\Enums\StatusPaket;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

trait PaketValidationRules
{
    /**
     * Aturan validasi paket, dipakai bersama oleh store dan update.
     *
     * @param  int|null  $ignoreId  ID paket yang dikecualikan dari cek unik saat update.
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    protected function paketRules(?int $ignoreId = null): array
    {
        return [
            'kode_paket' => [
                'required',
                'string',
                'max:50',
                Rule::unique('pakets', 'kode_paket')->ignore($ignoreId),
            ],
            'nama' => ['required', 'string', 'max:255'],
            'lokasi' => ['nullable', 'string', 'max:255'],
            'penyedia' => ['nullable', 'string', 'max:255'],
            // Rupiah penuh tanpa sen; batas atas menjaga nilai tetap muat di
            // unsignedBigInteger sekaligus di integer PHP.
            'nilai_kontrak' => ['required', 'integer', 'min:0', 'max:999999999999999'],
            'progres' => ['required', 'integer', 'between:0,100'],
            'status' => ['required', Rule::enum(StatusPaket::class)],
            'tahun_anggaran' => ['required', 'integer', 'between:2000,2100'],
            'tanggal_mulai' => ['nullable', 'date'],
            'tanggal_selesai' => ['nullable', 'date', 'after_or_equal:tanggal_mulai'],
            'keterangan' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
