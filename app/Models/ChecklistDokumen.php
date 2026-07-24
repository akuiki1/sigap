<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $tahap
 * @property string $nama
 * @property int $urutan
 * @property bool $wajib
 */
#[Fillable(['tahap', 'nama', 'urutan', 'wajib'])]
class ChecklistDokumen extends Model
{
    /**
     * Nama tabel eksplisit — tebakan pluralisasi bawaan Eloquent akan
     * berakhir "checklist_dokumens", padahal migrasinya "checklist_dokumen".
     */
    protected $table = 'checklist_dokumen';

    /**
     * Urutan tampil tahapan proyek, dari persiapan sampai pasca konstruksi.
     * Dipakai untuk mengurutkan "Checklist dokumen per tahap" di halaman detail.
     *
     * @var list<string>
     */
    public const array URUTAN_TAHAP = [
        'Persiapan & anggaran',
        'Perencanaan teknis',
        'Pengadaan',
        'Pelaksanaan konstruksi',
        'Pasca konstruksi',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'urutan' => 'integer',
            'wajib' => 'boolean',
        ];
    }

    /**
     * @return HasMany<DokumenPaket, $this>
     */
    public function dokumenPaket(): HasMany
    {
        return $this->hasMany(DokumenPaket::class);
    }
}
