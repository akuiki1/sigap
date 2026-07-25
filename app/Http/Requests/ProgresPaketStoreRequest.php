<?php

namespace App\Http\Requests;

use App\Models\Paket;
use App\Models\ProgresPaket;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ProgresPaketStoreRequest extends FormRequest
{
    /**
     * Hanya peran ber-hak-input (admin/operator) yang boleh mencatat progres.
     */
    public function authorize(): bool
    {
        $paket = $this->route('paket');

        return $paket instanceof Paket
            && ($this->user()?->can('create', [ProgresPaket::class, $paket]) ?? false);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * Minimal satu foto wajib — inti fitur ini adalah dokumentasi visual,
     * bukan sekadar angka persentase tanpa bukti. Format dibatasi ke foto
     * (bukan dokumen seperti berkas checklist) karena memang untuk itu
     * tujuannya: potret kondisi fisik di lapangan.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'tanggal' => ['required', 'date'],
            'persentase' => ['required', 'integer', 'min:0', 'max:100'],
            'keterangan' => ['nullable', 'string', 'max:1000'],
            'foto' => ['required', 'array', 'min:1'],
            'foto.*' => ['file', 'max:10240', 'mimes:jpg,jpeg,png'],
        ];
    }
}
