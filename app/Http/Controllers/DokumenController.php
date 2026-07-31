<?php

namespace App\Http\Controllers;

use App\Enums\StatusDokumen;
use App\Enums\StatusVerifikasi;
use App\Models\Berkas;
use App\Models\ChecklistDokumen;
use App\Models\DokumenPaket;
use App\Models\Paket;
use Illuminate\Contracts\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Penelusuran dokumen lintas paket. Halaman detail paket sudah menampilkan
 * checklist milik satu paket; layar ini menjawab pertanyaan sebaliknya —
 * "di paket mana saja As-built drawing belum ada?" — tanpa membuka paket
 * satu per satu. Murni baca: penyuntingan tetap di halaman detail paket.
 */
class DokumenController extends Controller
{
    public function index(Request $request): Response
    {
        $tahap = $this->pilihan($request, 'tahap', ChecklistDokumen::URUTAN_TAHAP);
        $status = $this->pilihan($request, 'status', StatusDokumen::values());
        $verifikasi = $this->pilihan($request, 'verifikasi', StatusVerifikasi::values());
        $tahun = $request->integer('tahun') ?: null;
        $cari = trim((string) $request->string('q'));

        $dokumen = DokumenPaket::query()
            // Kolom dibatasi eksplisit: baris daftar hanya butuh identitas paket,
            // bukan seluruh ~25 kolom pakets untuk tiap dokumen di halaman.
            ->with([
                'paket:id,kode_paket,nama,tahun_anggaran',
                'checklistDokumen:id,nama,tahap,wajib,urutan',
                'berkasTerkini.uploadedBy:id,name',
            ])
            ->when($status !== null, fn (Builder $q) => $q->where('status', $status))
            ->when(
                $tahap !== null,
                fn (Builder $q) => $q->whereHas('checklistDokumen', fn (Builder $c) => $c->where('tahap', $tahap)),
            )
            ->when(
                $tahun !== null,
                fn (Builder $q) => $q->whereHas('paket', fn (Builder $p) => $p->where('tahun_anggaran', $tahun)),
            )
            // Verifikasi menempel di berkas terkini, bukan di dokumen_paket. Item
            // tanpa berkas otomatis tersaring keluar — memang tidak punya status.
            ->when(
                $verifikasi !== null,
                fn (Builder $q) => $q->whereHas(
                    'berkas',
                    fn (Builder $b) => $b->where('is_terkini', true)->where('status_verifikasi', $verifikasi),
                ),
            )
            ->when($cari !== '', fn (Builder $q) => $q->where(
                fn (Builder $group) => $group
                    ->whereHas('checklistDokumen', fn (Builder $c) => $c->where('nama', 'like', "%{$cari}%"))
                    ->orWhereHas('paket', fn (Builder $p) => $p
                        ->where('nama', 'like', "%{$cari}%")
                        ->orWhere('kode_paket', 'like', "%{$cari}%")),
            ))
            ->paginate(20)
            ->withQueryString()
            ->through(fn (DokumenPaket $d) => [
                'id' => $d->id,
                'nama' => $d->checklistDokumen->nama,
                'tahap' => $d->checklistDokumen->tahap,
                'wajib' => $d->checklistDokumen->wajib,
                'status' => $d->status->value,
                'status_label' => $d->status->label(),
                'paket_id' => $d->paket_id,
                'paket_nama' => $d->paket->nama,
                'paket_kode' => $d->paket->kode_paket,
                'paket_tahun' => $d->paket->tahun_anggaran,
                'berkas' => $this->berkasRingkas($d->berkasTerkini),
            ]);

        return Inertia::render('dokumen/index', [
            'dokumen' => $dokumen,
            'filters' => [
                'tahap' => $tahap,
                'status' => $status,
                'verifikasi' => $verifikasi,
                'tahun' => $tahun,
                'q' => $cari !== '' ? $cari : null,
            ],
            'tahapOptions' => ChecklistDokumen::URUTAN_TAHAP,
            'statusOptions' => $this->opsiEnum(StatusDokumen::cases()),
            'verifikasiOptions' => $this->opsiEnum(StatusVerifikasi::cases()),
            'tahunOptions' => Paket::query()
                ->distinct()
                ->orderByDesc('tahun_anggaran')
                ->pluck('tahun_anggaran')
                ->all(),
        ]);
    }

    /**
     * Ambil nilai filter dari query string hanya bila termasuk daftar yang sah.
     * Nilai asing diperlakukan sebagai "tanpa filter", bukan error — parameter
     * ini datang dari URL yang bisa disunting/ditempel siapa saja.
     *
     * @param  list<string>  $sah
     */
    private function pilihan(Request $request, string $key, array $sah): ?string
    {
        $nilai = $request->string($key)->toString();

        return in_array($nilai, $sah, true) ? $nilai : null;
    }

    /**
     * @param  list<StatusDokumen>|list<StatusVerifikasi>  $cases
     * @return list<array{value: string, label: string}>
     */
    private function opsiEnum(array $cases): array
    {
        return array_map(
            fn (StatusDokumen|StatusVerifikasi $case): array => [
                'value' => $case->value,
                'label' => $case->label(),
            ],
            $cases,
        );
    }

    /**
     * Ringkasan berkas terkini untuk satu baris daftar. Sengaja lebih ramping
     * dari PaketController::berkasRingkas — daftar ini tidak menampilkan
     * catatan verifikasi maupun verifikator, cukup penanda status & unduhan.
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
            'diunggah_oleh' => $berkas->uploadedBy->name,
        ];
    }
}
