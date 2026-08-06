<?php

namespace App\Http\Requests;

use App\Enums\StatusVerifikasi;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Bentuk permintaan yang sama untuk tiap keputusan verifikasi — berkas maupun
 * entri progres. Aturan validasinya identik; yang berbeda hanya model apa yang
 * sedang diperiksa, dan itulah satu-satunya yang perlu diisi subclass.
 *
 * Sepasang dengan App\Models\Concerns\DapatDiverifikasi di sisi model.
 */
abstract class VerifikasiRequest extends FormRequest
{
    /**
     * Subjek yang sedang diverifikasi, diambil dari route model binding.
     * Kembalikan null bila parameter route bukan model yang diharapkan.
     */
    abstract protected function subjek(): ?Model;

    /**
     * Hanya peran ber-hak-verifikasi (admin/pengawas) yang boleh menyetujui
     * atau menolak; aturannya sendiri ada di policy masing-masing model.
     */
    public function authorize(): bool
    {
        $subjek = $this->subjek();

        return $subjek !== null && ($this->user()?->can('verify', $subjek) ?? false);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * catatan_verifikasi wajib diisi saat menolak (pelapor perlu tahu apa yang
     * harus diperbaiki), tapi opsional saat menyetujui.
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

    /**
     * Keputusan yang sudah tervalidasi sebagai enum, supaya controller tidak
     * perlu memanggil StatusVerifikasi::from() sendiri.
     */
    public function keputusan(): StatusVerifikasi
    {
        return StatusVerifikasi::from($this->validated('keputusan'));
    }
}
