<?php

namespace App\Models;

use App\Enums\StatusVerifikasi;
use App\Models\Concerns\DapatDiverifikasi;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $attachable_type
 * @property int $attachable_id
 * @property int $versi
 * @property bool $is_terkini
 * @property string $file_path
 * @property string $nama_asli
 * @property int $ukuran
 * @property string $mime_type
 * @property StatusVerifikasi $status_verifikasi
 * @property string|null $catatan_verifikasi
 * @property int $uploaded_by
 * @property int|null $diverifikasi_by
 * @property Carbon|null $diverifikasi_pada
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Model $attachable
 * @property-read User $uploadedBy
 * @property-read User|null $diverifikasiOleh
 */
// Kolom verifikasi (status_verifikasi, catatan_verifikasi, diverifikasi_by,
// diverifikasi_pada) tidak disebut di sini — DapatDiverifikasi yang
// mendaftarkannya, lihat catatan di trait itu.
#[Fillable([
    'file_path', 'nama_asli', 'ukuran', 'mime_type', 'versi', 'is_terkini', 'uploaded_by',
])]
class Berkas extends Model
{
    use DapatDiverifikasi;

    protected $table = 'berkas';

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'versi' => 'integer',
            'is_terkini' => 'boolean',
            'ukuran' => 'integer',
        ];
    }

    /**
     * @return MorphTo<Model, $this>
     */
    public function attachable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function uploadedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
