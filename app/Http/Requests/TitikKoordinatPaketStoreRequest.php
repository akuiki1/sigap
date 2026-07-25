<?php

namespace App\Http\Requests;

use App\Models\Paket;
use App\Models\TitikKoordinatPaket;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class TitikKoordinatPaketStoreRequest extends FormRequest
{
    /**
     * Hanya peran ber-hak-input (admin/operator) yang boleh menandai titik.
     */
    public function authorize(): bool
    {
        $paket = $this->route('paket');

        return $paket instanceof Paket
            && ($this->user()?->can('create', [TitikKoordinatPaket::class, $paket]) ?? false);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * Rentang lat/long dibatasi ke rentang bumi yang sah, bukan ke bounding box
     * Hulu Sungai Tengah — supaya salah ketik ekstrem tetap tertangkap tanpa
     * menolak titik di luar kabupaten (mis. paket yang lokasinya bergeser atau
     * data lama yang perlu dikoreksi belakangan).
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'label' => ['required', 'string', 'max:100'],
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'keterangan' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
