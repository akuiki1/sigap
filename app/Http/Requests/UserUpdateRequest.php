<?php

namespace App\Http\Requests;

use App\Enums\Role;
use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Yang bisa diubah admin atas akun orang lain hanyalah perannya. Nama, email,
 * dan kata sandi tetap milik pemilik akun lewat halaman Pengaturan — admin
 * tidak perlu (dan sebaiknya tidak bisa) menyunting identitas orang lain.
 */
class UserUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        $target = $this->route('pengguna');

        return $target instanceof User && ($this->user()?->can('update', $target) ?? false);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'role' => ['required', Rule::enum(Role::class)],
        ];
    }

    public function peran(): Role
    {
        return Role::from($this->validated('role'));
    }
}
