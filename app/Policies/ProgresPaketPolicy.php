<?php

namespace App\Policies;

use App\Models\Paket;
use App\Models\ProgresPaket;
use App\Models\User;

/**
 * Aturan "siapa boleh apa" atas entri riwayat progres fisik. Sama seperti
 * App\Policies\PaketPolicy: admin & operator sama-sama berhak penuh, jadi
 * gerbangnya tinggal autentikasi.
 */
class ProgresPaketPolicy
{
    /**
     * Mencatat entri progres baru untuk sebuah paket. $paket dilewatkan lewat
     * authorize('create', [ProgresPaket::class, $paket]).
     */
    public function create(User $user, Paket $paket): bool
    {
        return true;
    }

    public function verify(User $user, ProgresPaket $progresPaket): bool
    {
        return true;
    }
}
