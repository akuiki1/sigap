<?php

namespace App\Policies;

use App\Models\Paket;
use App\Models\ProgresPaket;
use App\Models\User;

/**
 * Aturan "siapa boleh apa" atas entri riwayat progres fisik. Melihat dibuka
 * untuk semua peran (bagian dari halaman detail paket); mencatat entri baru
 * & memverifikasi klaim persentase dibatasi peran, sama seperti PaketPolicy.
 */
class ProgresPaketPolicy
{
    /**
     * Mencatat entri progres baru untuk sebuah paket. $paket dilewatkan lewat
     * authorize('create', [ProgresPaket::class, $paket]).
     */
    public function create(User $user, Paket $paket): bool
    {
        return $user->bisaInput();
    }

    public function verify(User $user, ProgresPaket $progresPaket): bool
    {
        return $user->bisaVerifikasi();
    }
}
