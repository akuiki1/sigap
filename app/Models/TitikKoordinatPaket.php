<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $paket_id
 * @property string $label
 * @property float $latitude
 * @property float $longitude
 * @property string|null $keterangan
 * @property int $dicatat_by
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Paket $paket
 * @property-read User $dicatatOleh
 */
#[Fillable([
    'label', 'latitude', 'longitude', 'keterangan', 'dicatat_by',
])]
class TitikKoordinatPaket extends Model
{
    protected $table = 'titik_koordinat_paket';

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            // Float, bukan 'decimal:7' — cast decimal Eloquent menghasilkan
            // string, sedangkan Leaflet di frontend butuh angka.
            'latitude' => 'float',
            'longitude' => 'float',
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
    public function dicatatOleh(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dicatat_by');
    }
}
