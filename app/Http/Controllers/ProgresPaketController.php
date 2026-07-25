<?php

namespace App\Http\Controllers;

use App\Enums\StatusVerifikasi;
use App\Http\Requests\ProgresPaketStoreRequest;
use App\Http\Requests\ProgresPaketVerifyRequest;
use App\Models\Paket;
use App\Models\ProgresPaket;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class ProgresPaketController extends Controller
{
    /**
     * Catat entri riwayat progres fisik baru beserta foto pendukungnya.
     * Berbeda dari BerkasController::store: semua foto dalam satu entri
     * berlaku sekaligus (bukan versi/revisi), jadi tidak ada is_terkini
     * yang diarsipkan di sini.
     */
    public function store(ProgresPaketStoreRequest $request, Paket $paket): RedirectResponse
    {
        $progres = $paket->progresPaket()->create([
            'tanggal' => $request->validated('tanggal'),
            'persentase' => $request->validated('persentase'),
            'keterangan' => $request->validated('keterangan'),
            'status_verifikasi' => StatusVerifikasi::Diajukan,
            'dilaporkan_by' => $request->user()->id,
        ]);

        foreach ($request->file('foto') as $foto) {
            $path = $foto->store("progres/paket-{$paket->id}", 'local');

            $progres->foto()->create([
                'versi' => 1,
                'is_terkini' => true,
                'file_path' => $path,
                'nama_asli' => $foto->getClientOriginalName(),
                'ukuran' => $foto->getSize(),
                'mime_type' => $foto->getClientMimeType(),
                'status_verifikasi' => StatusVerifikasi::Diajukan,
                'uploaded_by' => $request->user()->id,
            ]);
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Progres {$progres->persentase}% pada {$progres->tanggal->format('d M Y')} berhasil dicatat.",
        ]);

        return back();
    }

    /**
     * Setujui atau tolak klaim persentase satu entri progres.
     */
    public function verify(ProgresPaketVerifyRequest $request, ProgresPaket $progresPaket): RedirectResponse
    {
        $keputusan = StatusVerifikasi::from($request->validated('keputusan'));

        $progresPaket->update([
            'status_verifikasi' => $keputusan,
            'catatan_verifikasi' => $request->validated('catatan_verifikasi'),
            'diverifikasi_by' => $request->user()->id,
            'diverifikasi_pada' => now(),
        ]);

        Inertia::flash('toast', [
            'type' => $keputusan === StatusVerifikasi::Diverifikasi ? 'success' : 'warning',
            'message' => $keputusan === StatusVerifikasi::Diverifikasi
                ? 'Entri progres disetujui.'
                : 'Entri progres ditolak.',
        ]);

        return back();
    }
}
