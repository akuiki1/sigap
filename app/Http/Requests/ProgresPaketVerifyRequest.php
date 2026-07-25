<?php

namespace App\Http\Requests;

use App\Enums\StatusVerifikasi;
use App\Models\ProgresPaket;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProgresPaketVerifyRequest extends FormRequest
{
    /**
     * Hanya peran ber-hak-verifikasi (admin/pengawas) yang boleh
     * menyetujui/menolak klaim progres.
     */
    public function authorize(): bool
    {
        $progresPaket = $this->route('progresPaket');

        return $progresPaket instanceof ProgresPaket
            && ($this->user()?->can('verify', $progresPaket) ?? false);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * catatan_verifikasi wajib diisi saat menolak, sama seperti BerkasVerifyRequest.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'keputusan' => [
                'required',
                Rule::in([StatusVerifikasi::Diverifikasi->value, StatusVerifikasi::Ditolak->value]),
            ],
            'catatan_verifikasi' => [
                Rule::requiredIf($this->input('keputusan') === StatusVerifikasi::Ditolak->value),
                'nullable',
                'string',
                'max:1000',
            ],
        ];
    }
}
