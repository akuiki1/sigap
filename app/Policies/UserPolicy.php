<?php

namespace App\Policies;

use App\Models\User;

/**
 * Kelola akun pengguna — satu-satunya kewenangan yang membedakan admin dari
 * operator (lihat App\Enums\Role). Policy lain di aplikasi ini terbuka untuk
 * kedua peran; yang ini tidak.
 */
class UserPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->bisaKelolaUser();
    }

    public function create(User $user): bool
    {
        return $user->bisaKelolaUser();
    }

    /**
     * Mengubah peran akun lain.
     *
     * Diri sendiri dikecualikan, dan itu yang menjaga selalu ada minimal satu
     * admin: admin terakhir tidak punya cara menurunkan dirinya sendiri jadi
     * operator, sehingga tidak mungkin semua orang terkunci dari layar ini.
     * Untuk berhenti jadi admin, minta admin lain yang menurunkannya.
     */
    public function update(User $user, User $target): bool
    {
        return $user->bisaKelolaUser() && ! $user->is($target);
    }

    /**
     * Menghapus akun lain. Sama seperti update: diri sendiri dikecualikan —
     * baik demi invarian "selalu ada admin" maupun agar admin tidak sengaja
     * menghapus akun yang sedang dipakainya login.
     */
    public function delete(User $user, User $target): bool
    {
        return $user->bisaKelolaUser() && ! $user->is($target);
    }
}
