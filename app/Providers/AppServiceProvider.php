<?php

namespace App\Providers;

use App\Models\DokumenPaket;
use App\Models\ProgresPaket;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        // Alias singkat untuk kolom attachable_type Berkas (tabel polimorfik),
        // supaya database tak menyimpan FQCN penuh — nama kelas bisa berubah
        // (mis. dipindah namespace) tanpa perlu migrasi data lama.
        Relation::enforceMorphMap([
            'dokumen_paket' => DokumenPaket::class,
            'progres_paket' => ProgresPaket::class,
        ]);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
