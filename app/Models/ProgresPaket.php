<?php

namespace App\Models;

use App\Enums\StatusVerifikasi;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $paket_id
 * @property Carbon $tanggal
 * @property int $persentase
 * @property string|null $keterangan
 * @property StatusVerifikasi $status_verifikasi
 * @property string|null $catatan_verifikasi
 * @property int $dilaporkan_by
 * @property int|null $diverifikasi_by
 * @property Carbon|null $diverifikasi_pada
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Paket $paket
 * @property-read User $dilaporkanOleh
 * @property-read User|null $diverifikasiOleh
 * @property-read Collection<int, Berkas> $foto
 */
#[Fillable([
    'tanggal', 'persentase', 'keterangan', 'status_verifikasi', 'dilaporkan_by',
    'catatan_verifikasi', 'diverifikasi_by', 'diverifikasi_pada',
])]
class ProgresPaket extends Model
{
    protected $table = 'progres_paket';

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'tanggal' => 'date:Y-m-d',
            'persentase' => 'integer',
            'status_verifikasi' => StatusVerifikasi::class,
            'diverifikasi_pada' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<Paket, $this>
     */
    public function paket(): BelongsTo
    {
        return $this->belongsTo(Paket::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function dilaporkanOleh(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dilaporkan_by');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function diverifikasiOleh(): BelongsTo
    {
        return $this->belongsTo(User::class, 'diverifikasi_by');
    }

    /**
     * Foto pendukung entri ini. Bisa lebih dari satu (beberapa sudut) —
     * semuanya berlaku sekaligus, bukan versi/revisi seperti dokumen checklist.
     *
     * @return MorphMany<Berkas, $this>
     */
    public function foto(): MorphMany
    {
        return $this->morphMany(Berkas::class, 'attachable');
    }
}
