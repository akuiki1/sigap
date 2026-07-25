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
        // Titik koordinat gedung di peta. Sengaja banyak titik per paket, bukan
        // sepasang kolom lat/long di `pakets`: satu paket bisa mencakup
        // beberapa bangunan/blok yang terpisah (mis. gedung utama + rumah
        // dinas), dan masing-masing perlu ditunjuk sendiri.
        Schema::create('titik_koordinat_paket', function (Blueprint $table) {
            $table->id();
            $table->foreignId('paket_id')->constrained('pakets')->cascadeOnDelete();
            $table->string('label');

            // Presisi 7 desimal ≈ 1 cm — jauh lebih halus dari yang dibutuhkan,
            // tapi cukup murah dan menghindari pembulatan saat titik diambil
            // dari GPS ponsel atau klik di peta.
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);

            $table->text('keterangan')->nullable();

            $table->foreignId('dicatat_by')->constrained('users');

            $table->timestamps();

            $table->index('paket_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('titik_koordinat_paket');
    }
};
