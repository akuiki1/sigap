<?php

namespace App\Http\Controllers;

use App\Enums\StatusDokumen;
use App\Models\ChecklistDokumen;
use App\Models\DokumenPaket;
use App\Models\Paket;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\ValidationException;

class DokumenPaketController extends Controller
{
    /**
     * Batalkan tanda "ada" pada satu item checklist, mengembalikannya ke
     * "belum" — dipakai bila berkas salah tempel ke item yang keliru.
     *
     * Sengaja tidak bisa dipakai untuk arah sebaliknya: status "ada" **hanya**
     * boleh lahir dari unggahan berkas (BerkasController::store). Dulu aksi ini
     * berupa toggle dua arah, dan itu membuat checklist bisa dicentang penuh
     * tanpa satu pun dokumen terunggah — persis kebalikan dari gunanya aplikasi
     * ini. Kelengkapan dokumen adalah cerminan berkas yang benar-benar ada,
     * bukan klaim yang diketuk manual.
     */
    public function update(Paket $paket, ChecklistDokumen $checklistDokumen): RedirectResponse
    {
        // Menandai kelengkapan dokumen = aksi input, sejalan dengan izin ubah paket.
        $this->authorize('update', $paket);

        /** @var DokumenPaket|null $dokumen */
        $dokumen = DokumenPaket::query()
            ->where('paket_id', $paket->id)
            ->where('checklist_dokumen_id', $checklistDokumen->id)
            ->first();

        if ($dokumen === null || $dokumen->status !== StatusDokumen::Ada) {
            throw ValidationException::withMessages([
                'status' => 'Item checklist hanya berstatus "ada" setelah berkasnya diunggah.',
            ]);
        }

        $dokumen->status = StatusDokumen::Belum;
        $dokumen->save();

        return back();
    }
}
