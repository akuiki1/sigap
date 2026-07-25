<?php

namespace App\Http\Requests;

use App\Models\Berkas;
use App\Models\Paket;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class BerkasStoreRequest extends FormRequest
{
    /**
     * Hanya peran ber-hak-input (admin/operator) yang boleh mengunggah berkas.
     */
    public function authorize(): bool
    {
        $paket = $this->route('paket');

        return $paket instanceof Paket
            && ($this->user()?->can('create', [Berkas::class, $paket]) ?? false);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * Format & ukuran dibatasi ke jenis dokumen yang lazim dipakai dinas:
     * PDF untuk dokumen administrasi/kontrak, JPG/PNG untuk foto dokumentasi
     * lapangan, DOC/XLS untuk berkas kerja yang belum di-PDF-kan. 10 MB
     * cukup untuk hasil pindai dokumen & foto ponsel tanpa membebani storage.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'file' => [
                'required',
                'file',
                'max:10240',
                'mimes:pdf,jpg,jpeg,png,doc,docx,xls,xlsx',
            ],
        ];
    }
}
