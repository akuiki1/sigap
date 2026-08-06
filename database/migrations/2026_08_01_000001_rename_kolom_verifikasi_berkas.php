<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Samakan penamaan dengan progres_paket (diverifikasi_by /
        // diverifikasi_pada). Selama namanya berbeda, alur verifikasi yang
        // identik di kedua tabel tidak bisa dibagikan lewat satu trait —
        // lihat App\Models\Concerns\DapatDiverifikasi. Sekalian meluruskan
        // penyimpangan dari konvensi bahasa domain (Indonesia).
        //
        // Nama constraint foreign key tetap berkas_verified_by_foreign; MySQL
        // mempertahankan constraint saat kolomnya di-rename dan namanya murni
        // kosmetik, jadi sengaja tidak ikut diubah.
        Schema::table('berkas', function (Blueprint $table) {
            $table->renameColumn('verified_by', 'diverifikasi_by');
            $table->renameColumn('verified_at', 'diverifikasi_pada');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('berkas', function (Blueprint $table) {
            $table->renameColumn('diverifikasi_by', 'verified_by');
            $table->renameColumn('diverifikasi_pada', 'verified_at');
        });
    }
};
