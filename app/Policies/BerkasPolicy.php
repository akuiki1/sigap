<?php

namespace App\Policies;

use App\Models\Berkas;
use App\Models\Paket;
use App\Models\User;

/**
 * Aturan "siapa boleh apa" atas berkas yang diunggah. Melihat/mengunduh
 * dibuka untuk semua peran (sama seperti PaketPolicy::view) karena berkas
 * adalah bagian dari data paket yang bisa dilihat siapa saja; hanya
 * mengunggah & memverifikasi yang dibatasi peran.
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
        return $user->bisaInput();
    }

    public function download(User $user, Berkas $berkas): bool
    {
        return true;
    }

    public function verify(User $user, Berkas $berkas): bool
    {
        return $user->bisaVerifikasi();
    }
}
