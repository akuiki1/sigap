<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class AuditController extends Controller
{
    /**
     * Display the audit review page.
     */
    public function review(): Response
    {
        return Inertia::render('audit/review');
    }
}
