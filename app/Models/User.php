<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Enums\Role;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Appends;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Laravel\Fortify\Contracts\PasskeyUser;
use Laravel\Fortify\PasskeyAuthenticatable;
use Laravel\Fortify\TwoFactorAuthenticatable;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property Role $role
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property Carbon|null $two_factor_confirmed_at
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read string $role_label
 * @property-read bool $can_input
 * @property-read bool $can_verify
 * @property-read bool $is_admin
 */
// `role` sengaja TIDAK masuk Fillable: pendaftaran mandiri tidak boleh menaikkan
// peran sendiri lewat mass-assignment. Perubahan peran hanya via jalur admin
// eksplisit (mis. User::setRole()).
#[Fillable(['name', 'email', 'password'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
// Diikutkan otomatis di setiap serialisasi (termasuk auth.user yang di-share ke
// tiap halaman Inertia lewat HandleInertiaRequests), supaya frontend bisa
// menyembunyikan tombol aksi tanpa duplikasi aturan App\Policies\PaketPolicy
// di sisi TypeScript — satu sumber kebenaran tetap di backend.
#[Appends(['role_label', 'can_input', 'can_verify', 'is_admin'])]
class User extends Authenticatable implements PasskeyUser
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, PasskeyAuthenticatable, TwoFactorAuthenticatable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'role' => Role::class,
        ];
    }

    /**
     * Label peran siap tampil (mis. "Auditor"), untuk ditampilkan di UI.
     *
     * @return Attribute<string, never>
     */
    protected function roleLabel(): Attribute
    {
        return Attribute::make(get: fn () => $this->role->label());
    }

    /**
     * Apakah pengguna memegang peran tertentu.
     */
    public function hasRole(Role $role): bool
    {
        return $this->role === $role;
    }

    /**
     * Bisa menginput/mengubah data (paket, berkas, progres). Dipakai baik
     * dari policy (App\Policies\PaketPolicy) maupun accessor can_input di bawah.
     */
    public function bisaInput(): bool
    {
        return $this->role->bisaInput();
    }

    /**
     * Bisa memverifikasi berkas & progres yang dilaporkan.
     */
    public function bisaVerifikasi(): bool
    {
        return $this->role->bisaVerifikasi();
    }

    /**
     * @return Attribute<bool, never>
     */
    protected function canInput(): Attribute
    {
        return Attribute::make(get: fn () => $this->bisaInput());
    }

    /**
     * @return Attribute<bool, never>
     */
    protected function canVerify(): Attribute
    {
        return Attribute::make(get: fn () => $this->bisaVerifikasi());
    }

    /**
     * @return Attribute<bool, never>
     */
    protected function isAdmin(): Attribute
    {
        return Attribute::make(get: fn () => $this->role === Role::Admin);
    }
}
