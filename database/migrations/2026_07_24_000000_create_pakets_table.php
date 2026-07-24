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
        Schema::create('pakets', function (Blueprint $table) {
            $table->id();
            $table->string('kode_paket')->unique();
            $table->string('nama');
            $table->string('lokasi')->nullable();
            $table->string('penyedia')->nullable();

            // Disimpan dalam rupiah penuh, bukan desimal: kontrak pemerintah
            // tidak memakai sen, dan integer menghindari kehilangan presisi
            // saat nilai diserialisasi ke JSON untuk Inertia.
            $table->unsignedBigInteger('nilai_kontrak')->default(0);

            $table->unsignedTinyInteger('progres')->default(0);

            // String, bukan enum MySQL, supaya menambah status baru tidak
            // memerlukan ALTER TABLE. Nilai divalidasi lewat App\Enums\StatusPaket.
            $table->string('status')->default('aktif');

            $table->unsignedSmallInteger('tahun_anggaran');
            $table->date('tanggal_mulai')->nullable();
            $table->date('tanggal_selesai')->nullable();
            $table->text('keterangan')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('tahun_anggaran');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pakets');
    }
};
