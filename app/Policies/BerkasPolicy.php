<?php

namespace App\Policies;

use App\Models\Berkas;
use App\Models\Paket;
use App\Models\User;

/**
 * Aturan "siapa boleh apa" atas berkas yang diunggah. Sama seperti
 * App\Policies\PaketPolicy: admin & operator sama-sama berhak penuh, jadi
 * gerbangnya tinggal autentikasi.
 *
 * Verifikasi tetap punya method sendiri karena controller memanggilnya
 * terpisah — dan di situlah pembatasan berlabuh seandainya pemisahan
 * "yang mengunggah bukan yang memverifikasi" kelak dibutuhkan lagi.
 */
class BerkasPolicy
{
    /**
     * Mengunggah berkas baru untuk sebuah paket. $paket dilewatkan lewat
     * authorize('create', [Berkas::class, $paket]) — sama seperti aturan
     * "boleh ubah paket ini" di PaketPolicy::update.
     */
    public function create(User $user, Paket $paket): bool
    {
        return true;
    }

    public function download(User $user, Berkas $berkas): bool
    {
        return true;
    }

    public function verify(User $user, Berkas $berkas): bool
    {
        return true;
    }
}
