<?php

namespace App\Policies;

use App\Models\Paket;
use App\Models\TitikKoordinatPaket;
use App\Models\User;

/**
 * Aturan "siapa boleh apa" atas titik koordinat paket. Sama seperti
 * App\Policies\PaketPolicy: admin & operator sama-sama berhak penuh, jadi
 * gerbangnya tinggal autentikasi.
 *
 * Tidak ada `verify` di sini: titik koordinat adalah metadata lokasi, bukan
 * bukti yang perlu disetujui seperti berkas & klaim progres.
 */
class TitikKoordinatPaketPolicy
{
    /**
     * Menandai titik baru pada sebuah paket. $paket dilewatkan lewat
     * authorize('create', [TitikKoordinatPaket::class, $paket]).
     */
    public function create(User $user, Paket $paket): bool
    {
        return true;
    }

    public function delete(User $user, TitikKoordinatPaket $titik): bool
    {
        return true;
    }
}
