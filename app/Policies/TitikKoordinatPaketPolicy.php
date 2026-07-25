<?php

namespace App\Policies;

use App\Models\Paket;
use App\Models\TitikKoordinatPaket;
use App\Models\User;

/**
 * Aturan "siapa boleh apa" atas titik koordinat paket. Melihat dibuka untuk
 * semua peran (bagian dari halaman detail paket); menandai & menghapus titik
 * dibatasi peran ber-hak-input, sama seperti ProgresPaketPolicy.
 *
 * Tidak ada `verify` di sini: titik koordinat adalah metadata lokasi, bukan
 * bukti yang perlu disetujui pengawas seperti berkas & klaim progres.
 */
class TitikKoordinatPaketPolicy
{
    /**
     * Menandai titik baru pada sebuah paket. $paket dilewatkan lewat
     * authorize('create', [TitikKoordinatPaket::class, $paket]).
     */
    public function create(User $user, Paket $paket): bool
    {
        return $user->bisaInput();
    }

    public function delete(User $user, TitikKoordinatPaket $titik): bool
    {
        return $user->bisaInput();
    }
}
