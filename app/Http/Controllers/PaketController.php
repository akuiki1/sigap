<?php

namespace App\Http\Controllers;

use App\Enums\StatusPaket;
use App\Http\Requests\PaketStoreRequest;
use App\Http\Requests\PaketUpdateRequest;
use App\Models\Paket;
use Illuminate\Http\RedirectResponse;
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
        return Inertia::render('paket/show', [
            'paket' => $paket,
            'statusLabel' => $paket->status->label(),
        ]);
    }

    /**
     * Show the form for editing the specified paket.
     */
    public function edit(Paket $paket): Response
    {
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
