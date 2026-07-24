<?php

namespace App\Concerns;

use Illuminate\Support\Carbon;

trait BuildsProgresPoints
{
    /**
     * Titik bulanan (Jan–Des tahun berjalan) untuk grafik realisasi vs
     * rencana ala kurva-S. Dipakai baik untuk agregat seluruh paket
     * (DashboardController) maupun satu paket (PaketController).
     *
     * Tidak ada pencatatan snapshot progres mingguan/bulanan saat ini, jadi
     * "realisasi" hanya diisi sampai bulan berjalan (bulan depan belum punya
     * data nyata) melalui interpolasi linear dari 0 di Januari — pendekatan,
     * bukan riwayat aktual. "Rencana" memakai dua segmen (0 → posisi hari
     * ini → 100% akhir tahun) supaya tetap naik monoton dan tetap melewati
     * titik $rencanaPersen yang sebenarnya di bulan berjalan.
     *
     * @return list<array{label: string, realisasi: int|null, rencana: int}>
     */
    private function progresPoints(int $realisasiPersen, ?int $rencanaPersen, Carbon $today): array
    {
        $bulanLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        $bulanIni = $today->month;
        $rencanaTarget = $rencanaPersen ?? (int) round(($bulanIni / 12) * 100);

        $points = [];
        foreach ($bulanLabels as $i => $label) {
            $bulanKe = $i + 1;

            // $bulanIni selalu 1..12 (Carbon::month), jadi kedua pembagi di
            // bawah ($bulanIni pada segmen pertama, 12-$bulanIni pada segmen
            // kedua) tidak pernah nol: segmen kedua hanya jalan saat
            // $bulanKe > $bulanIni, dan $bulanKe maksimal 12.
            $rencana = $bulanKe <= $bulanIni
                ? (int) round($rencanaTarget * $bulanKe / $bulanIni)
                : (int) round($rencanaTarget + (100 - $rencanaTarget) * ($bulanKe - $bulanIni) / (12 - $bulanIni));

            $points[] = [
                'label' => $label,
                'rencana' => $rencana,
                'realisasi' => match (true) {
                    $bulanKe > $bulanIni => null,
                    $bulanKe === $bulanIni => $realisasiPersen,
                    default => $bulanIni > 1 ? (int) round($realisasiPersen * ($bulanKe - 1) / ($bulanIni - 1)) : null,
                },
            ];
        }

        return $points;
    }
}
