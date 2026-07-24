<?php

namespace App\Http\Controllers;

use App\Enums\StatusPaket;
use App\Models\Paket;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the dashboard.
     */
    public function index(): Response
    {
        // Satu query agregat untuk seluruh kartu statistik, bukan empat count()
        // terpisah, supaya jumlah query tetap tetap saat status bertambah.
        /** @var array<string, int> $jumlahPerStatus */
        $jumlahPerStatus = Paket::query()
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status')
            ->map(fn ($total): int => (int) $total)
            ->all();

        return Inertia::render('dashboard', [
            'stats' => [
                'total_paket' => array_sum($jumlahPerStatus),
                'proyek_aktif' => $jumlahPerStatus[StatusPaket::Aktif->value] ?? 0,
                'selesai' => $jumlahPerStatus[StatusPaket::Selesai->value] ?? 0,
                'menunggu_audit' => $jumlahPerStatus[StatusPaket::MenungguAudit->value] ?? 0,
            ],
            'pakets' => Paket::query()
                ->latest('updated_at')
                ->limit(5)
                ->get(),
        ]);
    }
}
