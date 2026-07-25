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
        Schema::table('pakets', function (Blueprint $table) {
            // Alamat lengkap gedung — berbeda dari `lokasi` yang cuma sebutan
            // singkat untuk daftar & judul halaman ("Barabai", "Kec. Haruyan").
            // Dipakai bersama titik koordinat: alamat untuk dibaca manusia,
            // koordinat untuk ditunjuk di peta.
            $table->text('alamat')->nullable()->after('lokasi');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pakets', function (Blueprint $table) {
            $table->dropColumn('alamat');
        });
    }
};
