<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the dashboard.
     */
    public function index(): Response
    {
        return Inertia::render('dashboard', [
            'stats' => [
                'total_paket' => 0,
                'proyek_aktif' => 0,
                'selesai' => 0,
                'menunggu_audit' => 0,
            ],
            'pakets' => [],
        ]);
    }
}
