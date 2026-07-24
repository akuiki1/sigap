<?php

use App\Http\Controllers\AuditController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DokumenPaketController;
use App\Http\Controllers\PaketController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::resource('paket', PaketController::class);

    Route::patch('paket/{paket}/dokumen/{checklistDokumen}', [DokumenPaketController::class, 'update'])
        ->name('paket.dokumen.update');

    Route::get('audit', [AuditController::class, 'review'])->name('audit.review');
});

require __DIR__.'/settings.php';
