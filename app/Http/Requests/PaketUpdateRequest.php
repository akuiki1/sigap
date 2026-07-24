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
