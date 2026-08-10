<?php

namespace App\Http\Controllers;

use App\Enums\StatusPaket;
use App\Models\DokumenPaket;
use App\Models\Paket;
use App\Models\ProgresPaket;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the dashboard ("Ringkasan").
     *
     * Halamannya berbentuk grid kartu paket, satu kartu per paket tahun
     * anggaran berjalan. Daftar "perlu ditindaklanjuti", tenggat terdekat,
     * dan kurva agregat yang dulu berdiri sendiri di bawah dilebur ke dalam
     * kartunya masing-masing (lihat sorotKartu()): informasi yang sama, tapi
     * menempel pada paket yang bersangkutan alih-alih jadi daftar terpisah.
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
            // Foto sampul kartu diambil dari entri progres terbaru yang punya
            // foto, jadi entrinya perlu ikut terurut dari yang terbaru.
            ->with(['progresPaket' => fn ($q) => $q->orderByDesc('tanggal')->orderByDesc('id')->with('foto')])
            ->get();

        // Paket yang belum "Selesai" adalah yang relevan untuk kesiapan audit —
        // paket selesai dianggap sudah tuntas administrasinya.
        $ongoing = $pakets->reject(fn (Paket $p) => $p->status === StatusPaket::Selesai);

        $kelengkapanPersen = fn (Paket $p): int => $p->dokumen_total_count > 0
            ? (int) round($p->dokumen_ada_count / $p->dokumen_total_count * 100)
            : 0;

        $kesiapanAuditPersen = $ongoing->isNotEmpty()
            ? (int) round($ongoing->avg($kelengkapanPersen))
            : 100;

        $menujuPho = $pakets->filter(fn (Paket $p) => $this->jatuhTempoDalamHari($p, $today) !== null)->count();

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
                'menuju_pho' => $menujuPho,
            ],
            'packages' => $this->buildPackages($pakets, $today),
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
     * Satu kartu per paket tahun anggaran berjalan.
     *
     * Mengembalikan array biasa (bukan Collection): Illuminate\Support\Collection
     * men-declare TValue invariant, jadi anotasi shape presisi untuk hasil
     * rantai map()->sortBy()->values() tidak pernah cocok dengan inferensi
     * PHPStan meski secara struktur identik. Array polos tidak punya masalah
     * ini dan Inertia meng-encode keduanya sama saja.
     *
     * @param  Collection<int, Paket>  $pakets
     * @return array<int, array{id: int, nama: string, penyedia: string|null, nilai_kontrak: int, status: string, status_label: string, progres: int, pho_hari: int|null, foto: array{id: int, tanggal_label: string}|null, sorot: array{teks: string, tone: string}|null}>
     */
    private function buildPackages(Collection $pakets, Carbon $today): array
    {
        $tahunBerjalan = $today->year;

        /** @var Collection<int, Paket> $tahunIni */
        $tahunIni = $pakets->filter(fn (Paket $p) => $p->tahun_anggaran === $tahunBerjalan);

        $namaWajibBelum = $this->namaDokumenWajibBelum($tahunIni);

        return $tahunIni
            ->map(function (Paket $p) use ($namaWajibBelum, $today) {
                $sorot = $this->sorotKartu($p, $namaWajibBelum->get($p->id, collect()));

                return [
                    'id' => $p->id,
                    'nama' => $p->nama,
                    'penyedia' => $p->penyedia,
                    'nilai_kontrak' => $p->nilai_kontrak,
                    'status' => $p->status->value,
                    'status_label' => $p->status->label(),
                    'progres' => $p->progres,
                    'pho_hari' => $this->jatuhTempoDalamHari($p, $today),
                    'foto' => $this->fotoSampul($p),
                    'sorot' => $sorot,
                ];
            })
            // Paket bertanda tampil lebih dulu. sortBy PHP stabil sejak 8.0,
            // jadi urutan asli di masing-masing kelompok tetap terjaga.
            ->sortBy(fn ($p) => $p['sorot'] === null ? 1 : 0)
            ->values()
            ->all();
    }

    /**
     * Nama dokumen wajib yang masih berstatus "belum", dikelompokkan per paket.
     * Satu query untuk semua paket sekaligus, bukan per kartu.
     *
     * @param  Collection<int, Paket>  $pakets
     * @return Collection<int, Collection<int, string>>
     */
    private function namaDokumenWajibBelum(Collection $pakets): Collection
    {
        $ids = $pakets->filter(fn (Paket $p) => $p->dokumen_wajib_belum_count > 0)->pluck('id');

        return DokumenPaket::query()
            ->whereIn('paket_id', $ids)
            ->where('status', 'belum')
            ->whereHas('checklistDokumen', fn ($q) => $q->where('wajib', true))
            ->with('checklistDokumen:id,nama')
            ->get()
            ->groupBy('paket_id')
            ->map(fn ($group) => $group->pluck('checklistDokumen.nama')->values());
    }

    /**
     * Lencana satu baris di sudut kartu: hal paling mendesak dari paket ini,
     * atau null bila paketnya tidak perlu perhatian. Urutannya sengaja
     * berjenjang — hanya satu yang muat, jadi yang paling berat menang.
     *
     * @param  Collection<int, string>  $namaWajibBelum
     * @return array{teks: string, tone: string}|null
     */
    private function sorotKartu(Paket $paket, Collection $namaWajibBelum): ?array
    {
        // Paket selesai tidak lagi dinilai: deviasi dan checklist-nya sudah
        // tidak bisa ditindaklanjuti.
        if ($paket->status === StatusPaket::Selesai) {
            return null;
        }

        $deviasi = $paket->deviasiProgres();

        if ($deviasi !== null && $deviasi <= -10) {
            return ['teks' => sprintf('%d%% dari rencana', $deviasi), 'tone' => 'danger'];
        }

        if ($paket->dokumen_wajib_belum_count > 0) {
            $satuNama = $namaWajibBelum->first();

            $teks = $paket->dokumen_wajib_belum_count === 1 && $satuNama !== null
                ? $satuNama
                : "{$paket->dokumen_wajib_belum_count} dokumen wajib";

            return ['teks' => $teks, 'tone' => 'warn'];
        }

        if ($deviasi !== null && $deviasi < 0) {
            return ['teks' => sprintf('%d%% dari rencana', $deviasi), 'tone' => 'warn'];
        }

        return null;
    }

    /**
     * Foto sampul kartu: foto pertama dari entri progres terbaru yang punya
     * foto. Null bila paketnya belum pernah melampirkan foto — kartunya
     * memakai placeholder bergaris, bukan menyusut.
     *
     * @return array{id: int, tanggal_label: string}|null
     */
    private function fotoSampul(Paket $paket): ?array
    {
        $entri = $paket->progresPaket->first(
            fn (ProgresPaket $e) => $e->foto->isNotEmpty(),
        );

        if (! $entri) {
            return null;
        }

        $tanggal = $entri->tanggal->copy();
        $tanggal->locale('id');

        return [
            'id' => $entri->foto->first()->id,
            'tanggal_label' => $tanggal->translatedFormat('d M'),
        ];
    }
}
