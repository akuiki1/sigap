<?php

namespace App\Models;

use App\Enums\StatusPaket;
use Database\Factories\PaketFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $kode_paket
 * @property string $nama
 * @property string|null $lokasi
 * @property string|null $penyedia
 * @property int $nilai_kontrak
 * @property int $progres
 * @property StatusPaket $status
 * @property int $tahun_anggaran
 * @property Carbon|null $tanggal_mulai
 * @property Carbon|null $tanggal_selesai
 * @property string|null $keterangan
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'kode_paket',
    'nama',
    'lokasi',
    'penyedia',
    'nilai_kontrak',
    'progres',
    'status',
    'tahun_anggaran',
    'tanggal_mulai',
    'tanggal_selesai',
    'keterangan',
])]
class Paket extends Model
{
    /** @use HasFactory<PaketFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'nilai_kontrak' => 'integer',
            'progres' => 'integer',
            'tahun_anggaran' => 'integer',
            'status' => StatusPaket::class,
            // Format tanggal dipersempit ke Y-m-d agar langsung cocok dengan
            // <input type="date"> di form Inertia tanpa konversi di frontend.
            'tanggal_mulai' => 'date:Y-m-d',
            'tanggal_selesai' => 'date:Y-m-d',
        ];
    }

    /**
     * Batasi query ke paket dengan status tertentu.
     *
     * @param  Builder<Paket>  $query
     * @return Builder<Paket>
     */
    public function scopeBerstatus(Builder $query, StatusPaket $status): Builder
    {
        return $query->where('status', $status);
    }
}
