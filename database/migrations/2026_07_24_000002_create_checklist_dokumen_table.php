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
        // Master daftar dokumen kelengkapan per tahap, acuan Permen PUPR
        // 22/2018 dan Perka BPKP 3/2019 (lihat catatan riset di uploads/memori.md
        // pada bundel handoff desain). Tabel ini sama untuk semua paket — yang
        // berbeda per paket adalah status realisasinya, disimpan di dokumen_paket.
        Schema::create('checklist_dokumen', function (Blueprint $table) {
            $table->id();
            $table->string('tahap');
            $table->string('nama');
            $table->unsignedSmallInteger('urutan')->default(0);

            // Dokumen wajib tampil ditandai merah saat belum ada (bukan cuma
            // abu-abu "belum"), karena ketidakhadirannya langsung menggagalkan
            // kesiapan audit — bedanya dengan dokumen kondisional (mis. jaminan
            // uang muka, yang hanya wajib jika paket mengambil uang muka).
            $table->boolean('wajib')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('checklist_dokumen');
    }
};
