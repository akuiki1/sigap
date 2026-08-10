<?php

namespace App\Http\Requests\Settings;

use App\Concerns\PasswordValidationRules;
use App\Enums\Role;
use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class ProfileDeleteRequest extends FormRequest
{
    use PasswordValidationRules;

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'password' => $this->currentPasswordRules(),
        ];
    }

    /**
     * Admin terakhir tidak boleh menghapus akunnya sendiri. Pendaftaran mandiri
     * sudah ditutup dan akun hanya bisa dibuat admin, jadi tanpa penjaga ini
     * satu klik di halaman Pengaturan bisa membuat aplikasi tak punya jalan
     * membuat akun baru sama sekali — kecuali lewat tinker.
     */
    protected function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $pengguna = $this->user();

            if ($pengguna === null || ! $pengguna->bisaKelolaUser()) {
                return;
            }

            $adminLain = User::query()
                ->where('role', Role::Admin)
                ->whereKeyNot($pengguna->getKey())
                ->exists();

            if (! $adminLain) {
                $validator->errors()->add(
                    'password',
                    'Akun ini administrator terakhir. Angkat administrator lain dulu sebelum menghapus akun Anda.',
                );
            }
        });
    }
}
