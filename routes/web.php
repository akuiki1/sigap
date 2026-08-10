<?php

use App\Http\Controllers\BerkasController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DokumenController;
use App\Http\Controllers\DokumenPaketController;
use App\Http\Controllers\PaketController;
use App\Http\Controllers\ProgresPaketController;
use App\Http\Controllers\TitikKoordinatPaketController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::resource('paket', PaketController::class);

    Route::patch('paket/{paket}/dokumen/{checklistDokumen}', [DokumenPaketController::class, 'update'])
        ->name('paket.dokumen.update');

    Route::post('paket/{paket}/dokumen/{checklistDokumen}/berkas', [BerkasController::class, 'store'])
        ->name('paket.dokumen.berkas.store');
    Route::patch('berkas/{berkas}/verifikasi', [BerkasController::class, 'verify'])
        ->name('berkas.verify');
    Route::get('berkas/{berkas}/unduh', [BerkasController::class, 'download'])
        ->name('berkas.download');
    Route::get('berkas/{berkas}/pratinjau', [BerkasController::class, 'preview'])
        ->name('berkas.preview');

    Route::post('paket/{paket}/progres', [ProgresPaketController::class, 'store'])
        ->name('paket.progres.store');
    Route::patch('progres/{progresPaket}/verifikasi', [ProgresPaketController::class, 'verify'])
        ->name('progres.verify');

    Route::post('paket/{paket}/koordinat', [TitikKoordinatPaketController::class, 'store'])
        ->name('paket.koordinat.store');
    Route::delete('koordinat/{titikKoordinat}', [TitikKoordinatPaketController::class, 'destroy'])
        ->name('koordinat.destroy');

    Route::get('dokumen', [DokumenController::class, 'index'])->name('dokumen.index');

    // Kelola akun. Terbuka hanya untuk admin — penjaganya App\Policies\UserPolicy
    // lewat authorize() di controller & FormRequest, bukan middleware peran,
    // supaya aturannya satu tempat dengan policy lain.
    Route::get('pengguna', [UserController::class, 'index'])->name('pengguna.index');
    Route::post('pengguna', [UserController::class, 'store'])->name('pengguna.store');
    Route::patch('pengguna/{pengguna}', [UserController::class, 'update'])->name('pengguna.update');
    Route::delete('pengguna/{pengguna}', [UserController::class, 'destroy'])->name('pengguna.destroy');
});

require __DIR__.'/settings.php';
