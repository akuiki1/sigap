<?php

namespace App\Policies;

use App\Models\Paket;
use App\Models\User;

/**
 * Aturan "siapa boleh apa" atas data paket. Semua peran boleh melihat;
 * hanya peran ber-hak-input (admin/operator) yang boleh menambah & mengubah;
 * hanya admin yang boleh menghapus. Verifikasi berkas/progres diatur di
 * policy-nya masing-masing, bukan di sini.
 */
class PaketPolicy
{
    /**
     * Semua pengguna terautentikasi boleh melihat daftar paket.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Semua pengguna terautentikasi boleh melihat detail paket.
     */
    public function view(User $user, Paket $paket): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->bisaInput();
    }

    public function update(User $user, Paket $paket): bool
    {
        return $user->bisaInput();
    }

    public function delete(User $user, Paket $paket): bool
    {
        return $user->is_admin;
    }
}
