<?php

namespace App\Http\Controllers;

use App\Enums\StatusDokumen;
use App\Enums\StatusVerifikasi;
use App\Http\Requests\BerkasStoreRequest;
use App\Http\Requests\BerkasVerifyRequest;
use App\Models\Berkas;
use App\Models\ChecklistDokumen;
use App\Models\DokumenPaket;
use App\Models\Paket;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;

class BerkasController extends Controller
{
    /**
     * Unggah berkas baru untuk satu item checklist dokumen sebuah paket.
     * Versi sebelumnya (jika ada) diarsipkan (is_terkini=false), bukan
     * dihapus, supaya riwayat revisi tetap tertelusuri. Mengunggah otomatis
     * menandai checklist sebagai "ada" — status verifikasi (diajukan/
     * diverifikasi/ditolak) berjalan terpisah sebagai lapisan pemeriksaan,
     * lihat catatan di App\Enums\StatusVerifikasi.
     */
    public function store(BerkasStoreRequest $request, Paket $paket, ChecklistDokumen $checklistDokumen): RedirectResponse
    {
        $dokumenPaket = DokumenPaket::query()->firstOrCreate([
            'paket_id' => $paket->id,
            'checklist_dokumen_id' => $checklistDokumen->id,
        ]);

        $file = $request->file('file');
        $versiBaru = ((int) $dokumenPaket->berkas()->max('versi')) + 1;
        $path = $file->store("berkas/paket-{$paket->id}/dokumen-{$checklistDokumen->id}", 'local');

        $dokumenPaket->berkas()->where('is_terkini', true)->update(['is_terkini' => false]);

        $dokumenPaket->berkas()->create([
            'versi' => $versiBaru,
            'is_terkini' => true,
            'file_path' => $path,
            'nama_asli' => $file->getClientOriginalName(),
            'ukuran' => $file->getSize(),
            'mime_type' => $file->getClientMimeType(),
            'status_verifikasi' => StatusVerifikasi::Diajukan,
            'uploaded_by' => $request->user()->id,
        ]);

        $dokumenPaket->status = StatusDokumen::Ada;
        $dokumenPaket->save();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Berkas \"{$checklistDokumen->nama}\" berhasil diunggah, menunggu verifikasi.",
        ]);

        return back();
    }

    /**
     * Setujui atau tolak berkas yang sedang menunggu verifikasi. Penolakan
     * mengembalikan checklist ke status "belum" supaya kembali muncul di
     * daftar "perlu ditindaklanjuti" sampai diunggah ulang.
     */
    public function verify(BerkasVerifyRequest $request, Berkas $berkas): RedirectResponse
    {
        $keputusan = StatusVerifikasi::from($request->validated('keputusan'));

        $berkas->update([
            'status_verifikasi' => $keputusan,
            'catatan_verifikasi' => $request->validated('catatan_verifikasi'),
            'verified_by' => $request->user()->id,
            'verified_at' => now(),
        ]);

        if ($keputusan === StatusVerifikasi::Ditolak && $berkas->attachable instanceof DokumenPaket) {
            $berkas->attachable->update(['status' => StatusDokumen::Belum]);
        }

        Inertia::flash('toast', [
            'type' => $keputusan === StatusVerifikasi::Diverifikasi ? 'success' : 'warning',
            'message' => $keputusan === StatusVerifikasi::Diverifikasi
                ? 'Berkas disetujui.'
                : 'Berkas ditolak — menunggu unggahan ulang.',
        ]);

        return back();
    }

    /**
     * Unduh satu berkas. Disk privat (local) diserve lewat route
     * terautentikasi ini, bukan URL publik langsung — dokumen dinas/audit
     * tidak boleh diakses tanpa login.
     */
    public function download(Berkas $berkas): StreamedResponse
    {
        $this->authorize('download', $berkas);

        return Storage::disk('local')->download($berkas->file_path, $berkas->nama_asli);
    }
}
