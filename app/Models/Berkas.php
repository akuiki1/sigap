<?php

namespace App\Models;

use App\Enums\StatusVerifikasi;
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
 * @property int|null $verified_by
 * @property Carbon|null $verified_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Model $attachable
 * @property-read User $uploadedBy
 * @property-read User|null $verifiedBy
 */
#[Fillable([
    'file_path', 'nama_asli', 'ukuran', 'mime_type', 'versi', 'is_terkini',
    'status_verifikasi', 'uploaded_by', 'catatan_verifikasi', 'verified_by', 'verified_at',
])]
class Berkas extends Model
{
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
            'status_verifikasi' => StatusVerifikasi::class,
            'verified_at' => 'datetime',
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

    /**
     * @return BelongsTo<User, $this>
     */
    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }
}
