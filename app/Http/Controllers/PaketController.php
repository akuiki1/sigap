<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class PaketController extends Controller
{
    /**
     * Display a listing of the pakets.
     */
    public function index(): Response
    {
        return Inertia::render('paket/index', [
            'pakets' => [],
        ]);
    }

    /**
     * Show the form for creating a new paket.
     */
    public function create(): Response
    {
        return Inertia::render('paket/create');
    }

    /**
     * Display the specified paket.
     */
    public function show(string $paket): Response
    {
        return Inertia::render('paket/show', [
            'paket' => null,
        ]);
    }

    /**
     * Show the form for editing the specified paket.
     */
    public function edit(string $paket): Response
    {
        return Inertia::render('paket/edit', [
            'paket' => null,
        ]);
    }
}
