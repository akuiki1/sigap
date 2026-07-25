<?php

namespace App\Http\Controllers;

use App\Concerns\BuildsProgresPoints;
use App\Enums\StatusPaket;
use App\Http\Requests\PaketStoreRequest;
use App\Http\Requests\PaketUpdateRequest;
use App\Models\Berkas;
use App\Models\ChecklistDokumen;
use App\Models\DokumenPaket;
use App\Models\Paket;
use App\Models\ProgresPaket;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class PaketController extends Controller
{
    use BuildsProgresPoints;

    /**
     * Display a listing of the pakets.
     */
    public function index(): Response
    {
        return Inertia::render('paket/index', [
            'pakets' => Paket::query()
                ->latest('updated_at')
                ->paginate(15)
                ->withQueryString(),
        ]);
    }

    /**
     * Show the form for creating a new paket.
     */
    public function create(): Response
    {
        $this->authorize('create', Paket::class);

        return Inertia::render('paket/create', [
            'statusOptions' => $this->statusOptions(),
        ]);
    }

    /**
     * Store a newly created paket.
     */
    public function store(PaketStoreRequest $request): RedirectResponse
    {
        $paket = Paket::create($request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Paket {$paket->kode_paket} berhasil ditambahkan.",
        ]);

        return to_route('paket.show', $paket);
    }

    /**
     * Display the specified paket.
     */
    public function show(Paket $paket): Response
    {
        $paket->load([
            'dokumenPaket.checklistDokumen',
            'dokumenPaket.berkasTerkini.uploadedBy',
            'dokumenPaket.berkasTerkini.verifiedBy',
            'progresPaket' => fn ($query) => $query->latest('tanggal')->latest('id'),
            'progresPaket.foto',
            'progresPaket.dilaporkanOleh',
            'progresPaket.diverifikasiOleh',
        ]);

        $totalItem = $paket->dokumenPaket->count();
        $adaCount = $paket->dokumenPaket->filter(
            fn ($d) => $d->status->value === 'ada',
        )->count();

        $wajibBelum = $paket->dokumenPaket
            ->filter(fn ($d) => $d->status->value === 'belum' && $d->checklistDokumen->wajib)
            ->map(fn ($d) => $d->checklistDokumen->nama)
            ->values();

        $rencanaProgres = $paket->rencanaProgres();
        $today = Carbon::now();

        $mulaiPelaksanaan = $paket->tanggal_spmk ?? $paket->tanggal_mulai;
        $selesaiPelaksanaan = $paket->tanggal_pho_rencana ?? $paket->tanggal_selesai;

        return Inertia::render('paket/show', [
            'paket' => $paket,
            'statusLabel' => $paket->status->label(),
            'kelengkapanPersen' => $totalItem > 0 ? (int) round($adaCount / $totalItem * 100) : 0,
            'dokumenWajibBelum' => $wajibBelum,
            'rencanaProgres' => $rencanaProgres,
            'sections' => $this->groupSections($paket->dokumenPaket),
            'riwayatProgres' => $paket->progresPaket->map(fn (ProgresPaket $p) => $this->progresRingkas($p))->values(),
            'masaPelaksanaan' => $mulaiPelaksanaan && $selesaiPelaksanaan
                ? $mulaiPelaksanaan->diffInDays($selesaiPelaksanaan).' hari kalender'
                : null,
            'progresAgregat' => [
                'points' => $this->progresPoints($paket->progres, $rencanaProgres, $today),
                'realisasi' => $paket->progres,
                'rencana' => $rencanaProgres,
                'deviasi' => $rencanaProgres !== null ? $paket->progres - $rencanaProgres : null,
            ],
        ]);
    }

    /**
     * Kelompokkan checklist dokumen realisasi per tahap, dalam urutan tetap
     * (persiapan → pasca konstruksi), untuk kartu "Checklist dokumen per tahap".
     *
     * @param  Collection<int, DokumenPaket>  $dokumenPaket
     * @return array<int, array{tahap: string, done: int, total: int, docs: array<int, array<string, mixed>>}>
     */
    private function groupSections(Collection $dokumenPaket): array
    {
        $byTahap = $dokumenPaket
            ->sortBy(fn ($d) => $d->checklistDokumen->urutan)
            ->groupBy(fn ($d) => $d->checklistDokumen->tahap);

        return collect(ChecklistDokumen::URUTAN_TAHAP)
            ->filter(fn ($tahap) => $byTahap->has($tahap))
            ->map(function ($tahap) use ($byTahap) {
                $docs = $byTahap->get($tahap);

                return [
                    'tahap' => $tahap,
                    'done' => $docs->filter(fn ($d) => $d->status->value === 'ada')->count(),
                    'total' => $docs->count(),
                    'docs' => $docs->map(fn ($d) => [
                        'id' => $d->checklist_dokumen_id,
                        'nama' => $d->checklistDokumen->nama,
                        'status' => $d->status->value,
                        'wajib' => $d->checklistDokumen->wajib,
                        'berkas' => $this->berkasRingkas($d->berkasTerkini),
                    ])->values()->all(),
                ];
            })
            ->values()
            ->all();
    }

    /**
     * Ringkasan berkas terkini untuk ditampilkan di kartu checklist dokumen.
     * Null bila belum ada berkas yang diunggah untuk item ini.
     *
     * @return array<string, mixed>|null
     */
    private function berkasRingkas(?Berkas $berkas): ?array
    {
        if ($berkas === null) {
            return null;
        }

        return [
            'id' => $berkas->id,
            'nama_asli' => $berkas->nama_asli,
            'ukuran' => $berkas->ukuran,
            'versi' => $berkas->versi,
            'status_verifikasi' => $berkas->status_verifikasi->value,
            'status_verifikasi_label' => $berkas->status_verifikasi->label(),
            'catatan_verifikasi' => $berkas->catatan_verifikasi,
            'diunggah_oleh' => $berkas->uploadedBy->name,
            'diunggah_pada' => $berkas->created_at?->toIso8601String(),
            'diverifikasi_oleh' => $berkas->verifiedBy?->name,
        ];
    }

    /**
     * Ringkasan satu entri riwayat progres fisik beserta foto pendukungnya,
     * untuk kartu "Riwayat progres fisik" di halaman detail paket.
     *
     * @return array<string, mixed>
     */
    private function progresRingkas(ProgresPaket $progres): array
    {
        return [
            'id' => $progres->id,
            'tanggal' => $progres->tanggal->toDateString(),
            'persentase' => $progres->persentase,
            'keterangan' => $progres->keterangan,
            'status_verifikasi' => $progres->status_verifikasi->value,
            'status_verifikasi_label' => $progres->status_verifikasi->label(),
            'catatan_verifikasi' => $progres->catatan_verifikasi,
            'dilaporkan_oleh' => $progres->dilaporkanOleh->name,
            'diverifikasi_oleh' => $progres->diverifikasiOleh?->name,
            'foto' => $progres->foto->map(fn (Berkas $f) => [
                'id' => $f->id,
                'nama_asli' => $f->nama_asli,
                'ukuran' => $f->ukuran,
            ])->values()->all(),
        ];
    }

    /**
     * Show the form for editing the specified paket.
     */
    public function edit(Paket $paket): Response
    {
        $this->authorize('update', $paket);

        return Inertia::render('paket/edit', [
            'paket' => $paket,
            'statusOptions' => $this->statusOptions(),
        ]);
    }

    /**
     * Update the specified paket.
     */
    public function update(PaketUpdateRequest $request, Paket $paket): RedirectResponse
    {
        $paket->update($request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Paket {$paket->kode_paket} berhasil diperbarui.",
        ]);

        return to_route('paket.show', $paket);
    }

    /**
     * Remove the specified paket.
     */
    public function destroy(Paket $paket): RedirectResponse
    {
        $this->authorize('delete', $paket);

        $kode = $paket->kode_paket;

        $paket->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Paket {$kode} berhasil dihapus.",
        ]);

        return to_route('paket.index');
    }

    /**
     * Pilihan status untuk dropdown pada form.
     *
     * @return list<array{value: string, label: string}>
     */
    protected function statusOptions(): array
    {
        return array_map(
            fn (StatusPaket $status): array => [
                'value' => $status->value,
                'label' => $status->label(),
            ],
            StatusPaket::cases(),
        );
    }
}
