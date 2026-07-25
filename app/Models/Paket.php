<?php

namespace App\Models;

use App\Enums\StatusPaket;
use Database\Factories\PaketFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $kode_paket
 * @property string $nama
 * @property string|null $lokasi
 * @property string|null $penyedia
 * @property string|null $sumber_dana
 * @property int $nilai_kontrak
 * @property int|null $pagu
 * @property int $progres
 * @property StatusPaket $status
 * @property string|null $no_kontrak
 * @property string|null $konsultan_pengawas
 * @property string|null $ppk
 * @property string|null $pptk
 * @property int $tahun_anggaran
 * @property Carbon|null $tanggal_mulai
 * @property Carbon|null $tanggal_selesai
 * @property Carbon|null $tanggal_kontrak
 * @property Carbon|null $tanggal_spmk
 * @property Carbon|null $tanggal_mc0
 * @property Carbon|null $tanggal_pho_rencana
 * @property string|null $keterangan
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Collection<int, DokumenPaket> $dokumenPaket
 * @property-read Collection<int, ProgresPaket> $progresPaket
 * @property-read int $dokumen_total_count Alias withCount, lihat DashboardController/PaketController.
 * @property-read int $dokumen_ada_count Alias withCount, lihat DashboardController/PaketController.
 * @property-read int $dokumen_wajib_belum_count Alias withCount, lihat DashboardController/PaketController.
 */
#[Fillable([
    'kode_paket',
    'nama',
    'lokasi',
    'penyedia',
    'sumber_dana',
    'nilai_kontrak',
    'pagu',
    'progres',
    'status',
    'no_kontrak',
    'konsultan_pengawas',
    'ppk',
    'pptk',
    'tahun_anggaran',
    'tanggal_mulai',
    'tanggal_selesai',
    'tanggal_kontrak',
    'tanggal_spmk',
    'tanggal_mc0',
    'tanggal_pho_rencana',
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
            'pagu' => 'integer',
            'progres' => 'integer',
            'tahun_anggaran' => 'integer',
            'status' => StatusPaket::class,
            // Format tanggal dipersempit ke Y-m-d agar langsung cocok dengan
            // <input type="date"> di form Inertia tanpa konversi di frontend.
            'tanggal_mulai' => 'date:Y-m-d',
            'tanggal_selesai' => 'date:Y-m-d',
            'tanggal_kontrak' => 'date:Y-m-d',
            'tanggal_spmk' => 'date:Y-m-d',
            'tanggal_mc0' => 'date:Y-m-d',
            'tanggal_pho_rencana' => 'date:Y-m-d',
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

    /**
     * @return HasMany<DokumenPaket, $this>
     */
    public function dokumenPaket(): HasMany
    {
        return $this->hasMany(DokumenPaket::class);
    }

    /**
     * @return HasMany<ProgresPaket, $this>
     */
    public function progresPaket(): HasMany
    {
        return $this->hasMany(ProgresPaket::class);
    }

    /**
     * Progres fisik rencana (%) pada tanggal berjalan, dihitung linear antara
     * mulainya pelaksanaan (SPMK, atau tanggal mulai bila SPMK belum diisi)
     * dan target PHO (atau tanggal selesai). Belum ada pencatatan kurva-S
     * mingguan, jadi ini pendekatan garis lurus — bukan kurva-S sebenarnya.
     * Null bila salah satu tanggal batas belum diisi.
     */
    public function rencanaProgres(): ?int
    {
        $mulai = $this->tanggal_spmk ?? $this->tanggal_mulai;
        $selesai = $this->tanggal_pho_rencana ?? $this->tanggal_selesai;

        if (! $mulai || ! $selesai || $selesai->lessThanOrEqualTo($mulai)) {
            return null;
        }

        $totalHari = $mulai->diffInDays($selesai);
        $berjalanHari = $mulai->diffInDays(Carbon::now(), false);

        return (int) round(max(0, min(100, ($berjalanHari / $totalHari) * 100)));
    }

    /**
     * Selisih progres aktual terhadap rencana (poin persen). Negatif berarti
     * tertinggal dari rencana. Null bila rencana tidak dapat dihitung.
     */
    public function deviasiProgres(): ?int
    {
        $rencana = $this->rencanaProgres();

        return $rencana === null ? null : $this->progres - $rencana;
    }
}
