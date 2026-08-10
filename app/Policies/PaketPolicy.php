<?php

namespace App\Policies;

use App\Models\Paket;
use App\Models\User;

/**
 * Aturan "siapa boleh apa" atas data paket.
 *
 * Sejak peran diciutkan jadi admin & operator (lihat App\Enums\Role), keduanya
 * berhak penuh atas data paket — pembedanya hanya kelola akun, yang diatur di
 * App\Policies\UserPolicy. Jadi gerbang di sini tinggal autentikasi itu sendiri
 * (middleware `auth` di routes/web.php), dan policy-nya sengaja dipertahankan
 * agar panggilan authorize() di controller tetap punya satu tempat berlabuh
 * kalau suatu saat pembatasan per-paket (mis. hanya PPTK pemilik paket) muncul.
 */
class PaketPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Paket $paket): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Paket $paket): bool
    {
        return true;
    }

    /**
     * Menghapus paket ikut menghapus checklist, berkas, dan progres di
     * bawahnya. Dulu dibatasi admin; sekarang terbuka untuk operator juga
     * karena operator memang pemilik data hariannya.
     */
    public function delete(User $user, Paket $paket): bool
    {
        return true;
    }
}
