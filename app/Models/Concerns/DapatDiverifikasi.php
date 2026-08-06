<?php

namespace App\Models\Concerns;

use App\Enums\StatusVerifikasi;
use App\Models\User;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Alur verifikasi bersama untuk model yang klaimnya diperiksa pengawas/PPK:
 * App\Models\Berkas (keabsahan dokumen yang diunggah) dan
 * App\Models\ProgresPaket (klaim persentase fisik). Keduanya memakai kolom
 * yang sama — status_verifikasi, catatan_verifikasi, diverifikasi_by,
 * diverifikasi_pada — dan transisi yang sama, lihat App\Enums\StatusVerifikasi.
 *
 * Kolom mass-assignment sengaja didaftarkan lewat mergeFillable di sini, bukan
 * lewat atribut #[Fillable] di masing-masing model: atribut PHP milik trait
 * TIDAK terbaca oleh ReflectionClass::getAttributes() pada kelas pemakainya,
 * jadi trait memang tidak bisa menyumbang #[Fillable]. Ini justru yang
 * diinginkan — lupa mendaftarkan kolom verifikasi sudah dua kali membuat
 * Eloquent membuangnya diam-diam tanpa error, dan sekarang kolomnya ikut
 * otomatis begitu trait dipakai.
 *
 * Aman dari urutan: Laravel menjalankan semua initializer trait lewat
 * Model::initializeTraits(), dan baik mergeFillable maupun mergeCasts sama-sama
 * array_merge — jadi tidak jadi soal apakah initializer ini berjalan sebelum
 * atau sesudah initializeGuardsAttributes/initializeHasAttributes bawaan.
 */
trait DapatDiverifikasi
{
    /**
     * Dipanggil Laravel lewat konvensi initialize{NamaTrait} untuk tiap
     * instance model yang memakai trait ini.
     */
    protected function initializeDapatDiverifikasi(): void
    {
        $this->mergeFillable([
            'status_verifikasi', 'catatan_verifikasi', 'diverifikasi_by', 'diverifikasi_pada',
        ]);

        $this->mergeCasts([
            'status_verifikasi' => StatusVerifikasi::class,
            'diverifikasi_pada' => 'datetime',
        ]);
    }

    /**
     * Pengawas/PPK yang memutuskan. Null selama masih berstatus diajukan.
     *
     * @return BelongsTo<User, $this>
     */
    public function diverifikasiOleh(): BelongsTo
    {
        return $this->belongsTo(User::class, 'diverifikasi_by');
    }

    /**
     * Catat keputusan verifikasi berikut jejak siapa & kapan. Efek samping
     * khas tiap model (mis. mengembalikan checklist dokumen ke "belum" saat
     * ditolak) tetap urusan controller masing-masing.
     */
    public function tandaiVerifikasi(StatusVerifikasi $keputusan, ?string $catatan, User $verifikator): void
    {
        $this->update([
            'status_verifikasi' => $keputusan,
            'catatan_verifikasi' => $catatan,
            'diverifikasi_by' => $verifikator->id,
            'diverifikasi_pada' => now(),
        ]);
    }
}
