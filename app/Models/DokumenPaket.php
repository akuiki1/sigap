<?php

namespace App\Models;

use App\Enums\StatusDokumen;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $paket_id
 * @property int $checklist_dokumen_id
 * @property StatusDokumen $status
 * @property-read ChecklistDokumen $checklistDokumen
 * @property-read Paket $paket
 */
#[Fillable(['paket_id', 'checklist_dokumen_id', 'status'])]
class DokumenPaket extends Model
{
    /**
     * Nama tabel eksplisit — tebakan pluralisasi bawaan Eloquent akan
     * berakhir "dokumen_pakets", padahal migrasinya "dokumen_paket".
     */
    protected $table = 'dokumen_paket';

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => StatusDokumen::class,
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
     * @return BelongsTo<ChecklistDokumen, $this>
     */
    public function checklistDokumen(): BelongsTo
    {
        return $this->belongsTo(ChecklistDokumen::class);
    }
}
