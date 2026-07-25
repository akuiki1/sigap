<?php

namespace App\Http\Controllers;

use App\Http\Requests\TitikKoordinatPaketStoreRequest;
use App\Models\Paket;
use App\Models\TitikKoordinatPaket;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class TitikKoordinatPaketController extends Controller
{
    /**
     * Tandai satu titik koordinat baru pada sebuah paket.
     */
    public function store(TitikKoordinatPaketStoreRequest $request, Paket $paket): RedirectResponse
    {
        $titik = $paket->titikKoordinat()->create([
            'label' => $request->validated('label'),
            'latitude' => $request->validated('latitude'),
            'longitude' => $request->validated('longitude'),
            'keterangan' => $request->validated('keterangan'),
            'dicatat_by' => $request->user()->id,
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Titik \"{$titik->label}\" berhasil ditandai.",
        ]);

        return back();
    }

    /**
     * Hapus satu titik. Tidak ada soft delete: titik salah tandai lebih baik
     * hilang sekalian daripada menyisakan penanda keliru di peta.
     */
    public function destroy(TitikKoordinatPaket $titikKoordinat): RedirectResponse
    {
        $this->authorize('delete', $titikKoordinat);

        $label = $titikKoordinat->label;

        $titikKoordinat->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Titik \"{$label}\" berhasil dihapus.",
        ]);

        return back();
    }
}
