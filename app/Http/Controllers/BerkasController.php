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
        $keputusan = $request->keputusan();

        $berkas->tandaiVerifikasi(
            $keputusan,
            $request->validated('catatan_verifikasi'),
            $request->user(),
        );

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

    /**
     * Jenis berkas yang aman disajikan inline (dirender di dalam halaman).
     *
     * Sengaja daftar putih, bukan daftar hitam: menyajikan berkas unggahan
     * dengan Content-Disposition: inline berarti peramban boleh mengeksekusi
     * isinya, sehingga satu berkas HTML/SVG yang lolos akan berjalan pada
     * origin aplikasi. PDF & raster tidak punya masalah itu.
     *
     * @var list<string>
     */
    private const array MIME_PRATINJAU = [
        'application/pdf',
        'image/jpeg',
        'image/png',
    ];

    /**
     * Sajikan berkas untuk dipratinjau di dalam panel dokumen (Content-
     * Disposition: inline), bukan diunduh. Terpisah dari download() karena
     * kedua disposisi itu tidak bisa hidup di satu respons, dan pemisahan ini
     * sekalian menjadi tempat menegakkan daftar putih jenis berkas di atas.
     */
    public function preview(Berkas $berkas): StreamedResponse
    {
        $this->authorize('download', $berkas);

        if (! in_array($berkas->mime_type, self::MIME_PRATINJAU, true)) {
            return Storage::disk('local')->download($berkas->file_path, $berkas->nama_asli);
        }

        return Storage::disk('local')->response($berkas->file_path, $berkas->nama_asli, [
            'Content-Type' => $berkas->mime_type,
            // Peramban tidak boleh menebak ulang jenis isinya dan berakhir
            // mengeksekusi sesuatu yang bukan gambar/PDF.
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }
}
