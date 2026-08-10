<?php

namespace App\Http\Requests;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Enums\Role;
use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UserStoreRequest extends FormRequest
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Hanya admin yang boleh membuat akun. Dicek di sini, bukan di controller,
     * agar penolakan 403 terjadi sebelum validasi payload dijalankan.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('create', User::class) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            ...$this->profileRules(),
            'password' => $this->passwordRules(),
            'role' => ['required', Rule::enum(Role::class)],
        ];
    }

    /**
     * Peran tervalidasi sebagai enum, supaya controller tidak perlu memanggil
     * Role::from() sendiri.
     */
    public function peran(): Role
    {
        return Role::from($this->validated('role'));
    }
}
