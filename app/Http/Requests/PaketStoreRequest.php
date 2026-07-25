<?php

namespace App\Http\Requests;

use App\Concerns\PaketValidationRules;
use App\Models\Paket;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class PaketStoreRequest extends FormRequest
{
    use PaketValidationRules;

    /**
     * Hanya peran ber-hak-input (admin/operator) yang boleh membuat paket.
     * Dicek di sini, bukan di controller, agar penolakan 403 terjadi sebelum
     * validasi payload dijalankan.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('create', Paket::class) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return $this->paketRules();
    }
}
