<?php

namespace App\Http\Requests;

use App\Concerns\PaketValidationRules;
use App\Models\Paket;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class PaketUpdateRequest extends FormRequest
{
    use PaketValidationRules;

    /**
     * Hanya peran ber-hak-input (admin/operator) yang boleh mengubah paket.
     * Dicek di sini agar penolakan 403 terjadi sebelum validasi payload.
     */
    public function authorize(): bool
    {
        $paket = $this->route('paket');

        return $paket instanceof Paket
            && ($this->user()?->can('update', $paket) ?? false);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $paket = $this->route('paket');

        return $this->paketRules($paket instanceof Paket ? $paket->id : null);
    }
}
