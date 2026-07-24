<?php

namespace App\Http\Controllers;

use App\Enums\StatusPaket;
use App\Models\Paket;
use Inertia\Inertia;
use Inertia\Response;

class AuditController extends Controller
{
    /**
     * Display the audit review page.
     */
    public function review(): Response
    {
        return Inertia::render('audit/review', [
            'pakets' => Paket::query()
                ->berstatus(StatusPaket::MenungguAudit)
                ->latest('updated_at')
                ->get(),
        ]);
    }
}
