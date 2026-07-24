<?php

namespace App\Http\Controllers;

use App\Concerns\BuildsProgresPoints;
use App\Enums\StatusPaket;
use App\Models\DokumenPaket;
use App\Models\Paket;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    use BuildsProgresPoints;

    /**
     * Display the dashboard ("Ringkasan").
     */
    public function index(): Response
    {
        $today = Carbon::now();

        // Satu query beragregat lewat withCount untuk seluruh paket, bukan
        // N+1 per paket, supaya jumlah query tetap konstan saat data bertambah.
        $pakets = Paket::query()
            ->withCount([
                'dokumenPaket as dokumen_total_count',
                'dokumenPaket as dokumen_ada_count' => fn ($q) => $q->where('status', 'ada'),
                'dokumenPaket as dokumen_wajib_belum_count' => fn ($q) => $q->where('status', 'belum')
                    ->whereHas('checklistDokumen', fn ($q2) => $q2->where('wajib', true)),
            ])
            ->get();

        // Paket yang belum "Selesai" adalah yang relevan untuk kesiapan audit —
        // paket selesai dianggap sudah tuntas administrasinya.
        $ongoing = $pakets->reject(fn (Paket $p) => $p->status === StatusPaket::Selesai);

        $kelengkapanPersen = fn (Paket $p): int => $p->dokumen_total_count > 0
            ? (int) round($p->dokumen_ada_count / $p->dokumen_total_count * 100)
            : 0;

        $dokumenBelumLengkap = (int) $ongoing->sum(
            fn (Paket $p) => $p->dokumen_total_count - $p->dokumen_ada_count,
        );

        $kesiapanAuditPersen = $ongoing->isNotEmpty()
            ? (int) round($ongoing->avg($kelengkapanPersen))
            : 100;

        $menujuPho = $pakets->filter(fn (Paket $p) => $this->jatuhTempoDalamHari($p, $today) !== null)->count();

        [$followups, $followupPaketCount] = $this->buildFollowups($ongoing, $today);

        $packages = $this->buildPackages($pakets, $today);

        $progresAgregat = $this->buildProgresAgregat($ongoing, $today);

        $tenggatTerdekat = $pakets
            ->map(fn (Paket $p) => [$p, $this->jatuhTempoDalamHari($p, $today)])
            ->filter(fn ($pair) => $pair[1] !== null)
            ->sortBy(fn ($pair) => $pair[1])
            ->take(3)
            ->map(fn ($pair) => [
                'paket_id' => $pair[0]->id,
                'title' => 'Serah terima pertama (PHO)',
                'pkg' => $pair[0]->nama,
                'hari' => $pair[1],
            ])
            ->values();

        // Dipisah dari chaining ->locale()->translatedFormat() langsung:
        // Carbon::locale() diketik sebagai getter/setter campuran di stub-nya,
        // jadi hasil chain-nya ambigu bagi PHPStan meski aman saat runtime.
        $todayForLabel = $today->copy();
        $todayForLabel->locale('id');

        return Inertia::render('dashboard', [
            'todayLabel' => $todayForLabel->translatedFormat('d F Y'),
            'stats' => [
                'paket_aktif' => $pakets->filter(fn (Paket $p) => $p->status === StatusPaket::Aktif)->count(),
                'kesiapan_audit_persen' => $kesiapanAuditPersen,
                'dokumen_belum_lengkap' => $dokumenBelumLengkap,
                'menuju_pho' => $menujuPho,
            ],
            'followupPaketCount' => $followupPaketCount,
            'followups' => $followups,
            'packages' => $packages,
            'progresAgregat' => $progresAgregat,
            'tenggatTerdekat' => $tenggatTerdekat,
            'tahunBerjalan' => $today->year,
        ]);
    }

    /**
     * Jumlah hari menuju PHO rencana, hanya untuk paket yang belum selesai
     * dan jatuh tempo dalam 30 hari ke depan. Null bila tidak relevan.
     */
    private function jatuhTempoDalamHari(Paket $paket, Carbon $today): ?int
    {
        if ($paket->status === StatusPaket::Selesai || ! $paket->tanggal_pho_rencana) {
            return null;
        }

        $hari = (int) $today->copy()->startOfDay()->diffInDays($paket->tanggal_pho_rencana, false);

        return $hari >= 0 && $hari <= 30 ? $hari : null;
    }

    /**
     * Bangun daftar "Perlu ditindaklanjuti": paket dengan dokumen wajib yang
     * belum lengkap, atau progres fisik yang tertinggal dari rencana.
     *
     * @param  Collection<int, Paket>  $ongoing
     * @return array{0: Collection<int, array<string, mixed>>, 1: int}
     */
    private function buildFollowups(Collection $ongoing, Carbon $today): array
    {
        $wajibBelumIds = $ongoing->filter(fn (Paket $p) => $p->dokumen_wajib_belum_count > 0)->pluck('id');

        $namaWajibBelum = DokumenPaket::query()
            ->whereIn('paket_id', $wajibBelumIds)
            ->where('status', 'belum')
            ->whereHas('checklistDokumen', fn ($q) => $q->where('wajib', true))
            ->with('checklistDokumen:id,nama')
            ->get()
            ->groupBy('paket_id')
            ->map(fn ($group) => $group->pluck('checklistDokumen.nama')->values());

        /** @var Collection<int, array<string, mixed>> $items */
        $items = collect();

        foreach ($ongoing as $paket) {
            $deviasi = $paket->deviasiProgres();

            if ($paket->dokumen_wajib_belum_count > 0) {
                $nama = $namaWajibBelum->get($paket->id, collect());
                $text = $paket->dokumen_wajib_belum_count === 1
                    ? "{$nama->first()} belum diunggah"
                    : "{$paket->dokumen_wajib_belum_count} dokumen wajib belum diunggah";

                $items->push([
                    'paket_id' => $paket->id,
                    'text' => $text,
                    'pkg' => $paket->nama,
                    'meta' => 'Wajib dilengkapi',
                    'tone' => 'warn',
                    'severity' => 100 + $paket->dokumen_wajib_belum_count,
                ]);
            }

            if ($deviasi !== null && $deviasi <= -10) {
                $items->push([
                    'paket_id' => $paket->id,
                    'text' => 'Progres fisik tertinggal dari rencana',
                    'pkg' => $paket->nama,
                    'meta' => sprintf('%d%%', $deviasi),
                    'tone' => 'danger',
                    'severity' => 200 + abs($deviasi),
                ]);
            }
        }

        $paketTerlibat = $items->pluck('paket_id')->unique()->count();

        return [
            $items->sortByDesc('severity')->take(5)->values()->map(
                fn ($item) => collect($item)->except('severity')->all(),
            ),
            $paketTerlibat,
        ];
    }

    /**
     * Mengembalikan array biasa (bukan Collection): Illuminate\Support\Collection
     * men-declare TValue invariant, jadi anotasi shape presisi untuk hasil
     * rantai map()->sortBy()->values() tidak pernah cocok dengan inferensi
     * PHPStan meski secara struktur identik. Array polos tidak punya masalah
     * ini dan Inertia meng-encode keduanya sama saja.
     *
     * @param  Collection<int, Paket>  $pakets
     * @return array<int, array{id: int, nama: string, penyedia: string|null, nilai_kontrak: int, status_label: string, progres: int, flag: string|null}>
     */
    private function buildPackages(Collection $pakets, Carbon $today): array
    {
        $tahunBerjalan = $today->year;

        return $pakets
            ->filter(fn (Paket $p) => $p->tahun_anggaran === $tahunBerjalan)
            ->map(function (Paket $p) {
                $deviasi = $p->status === StatusPaket::Selesai ? null : $p->deviasiProgres();
                $wajibBelum = $p->status === StatusPaket::Selesai ? 0 : $p->dokumen_wajib_belum_count;

                $flag = null;
                if ($wajibBelum > 0 || ($deviasi !== null && $deviasi < 0)) {
                    $flag = ($deviasi !== null && $deviasi <= -10) ? 'danger' : 'warn';
                }

                return [
                    'id' => $p->id,
                    'nama' => $p->nama,
                    'penyedia' => $p->penyedia,
                    'nilai_kontrak' => $p->nilai_kontrak,
                    'status_label' => $p->status->label(),
                    'progres' => $p->progres,
                    'flag' => $flag,
                ];
            })
            // riskFirst: paket bertanda (warn/danger) tampil lebih dulu. usort
            // PHP stabil sejak 8.0, jadi urutan asli di masing-masing kelompok
            // (terbaru diperbarui dulu, dari query) tetap terjaga.
            ->sortBy(fn ($p) => $p['flag'] === null ? 1 : 0)
            ->values()
            ->all();
    }

    /**
     * Data kurva realisasi vs rencana untuk grafik "Progres agregat". Tidak
     * ada pencatatan snapshot progres mingguan/bulanan saat ini, jadi garis
     * dibentuk dari interpolasi linear antara awal tahun dan posisi hari ini
     * — pendekatan, bukan riwayat aktual. Rencana memakai rata-rata hasil
     * Paket::rencanaProgres() (linear per paket berdasarkan tanggal SPMK–PHO).
     *
     * @param  Collection<int, Paket>  $ongoing
     * @return array{points: list<array{label: string, realisasi: int|null, rencana: int}>, realisasi: int, rencana: int|null, deviasi: int|null}
     */
    private function buildProgresAgregat(Collection $ongoing, Carbon $today): array
    {
        $realisasiPersen = $ongoing->isNotEmpty() ? (int) round($ongoing->avg('progres')) : 0;

        $rencanaValues = $ongoing->map(fn (Paket $p) => $p->rencanaProgres())->filter(fn ($v) => $v !== null);
        $rencanaPersen = $rencanaValues->isNotEmpty() ? (int) round($rencanaValues->avg()) : null;

        return [
            'points' => $this->progresPoints($realisasiPersen, $rencanaPersen, $today),
            'realisasi' => $realisasiPersen,
            'rencana' => $rencanaPersen,
            'deviasi' => $rencanaPersen !== null ? $realisasiPersen - $rencanaPersen : null,
        ];
    }
}
