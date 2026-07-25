<?php

namespace App\Http\Controllers;

use App\Enums\StatusDokumen;
use App\Models\ChecklistDokumen;
use App\Models\DokumenPaket;
use App\Models\Paket;
use Illuminate\Http\RedirectResponse;

class DokumenPaketController extends Controller
{
    /**
     * Tandai satu item checklist dokumen sebagai ada/belum untuk sebuah paket.
     * Baris dokumen_paket seharusnya sudah ada dari seeding/pembuatan paket,
     * tapi dibuat di sini juga (updateOrCreate) untuk berjaga-jaga bila
     * checklist_dokumen bertambah setelah paket dibuat.
     */
    public function update(Paket $paket, ChecklistDokumen $checklistDokumen): RedirectResponse
    {
        // Menandai kelengkapan dokumen = aksi input, sejalan dengan izin ubah paket.
        $this->authorize('update', $paket);

        /** @var DokumenPaket $dokumen */
        $dokumen = DokumenPaket::query()->firstOrNew([
            'paket_id' => $paket->id,
            'checklist_dokumen_id' => $checklistDokumen->id,
        ]);

        $dokumen->status = $dokumen->exists && $dokumen->status === StatusDokumen::Ada
            ? StatusDokumen::Belum
            : StatusDokumen::Ada;
        $dokumen->save();

        return back();
    }
}
