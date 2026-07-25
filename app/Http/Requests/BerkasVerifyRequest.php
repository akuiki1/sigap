<?php

namespace App\Http\Requests;

use App\Enums\StatusVerifikasi;
use App\Models\Berkas;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BerkasVerifyRequest extends FormRequest
{
    /**
     * Hanya peran ber-hak-verifikasi (admin/pengawas) yang boleh
     * menyetujui/menolak berkas.
     */
    public function authorize(): bool
    {
        $berkas = $this->route('berkas');

        return $berkas instanceof Berkas
            && ($this->user()?->can('verify', $berkas) ?? false);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * catatan_verifikasi wajib diisi saat menolak (operator perlu tahu apa
     * yang harus diperbaiki), tapi opsional saat menyetujui.
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
