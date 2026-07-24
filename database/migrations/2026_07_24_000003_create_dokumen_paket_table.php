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
        // Realisasi checklist_dokumen per paket — jantung penghitungan
        // "kelengkapan dokumen" & "kesiapan audit" di dashboard dan halaman
        // detail paket. Baris dibuat untuk setiap kombinasi paket × item
        // checklist saat paket dibuat (lihat DatabaseSeeder / observer),
        // supaya kondisi "belum diisi" dan "sudah ditandai belum" bisa dibedakan
        // dari tidak adanya baris sama sekali.
        Schema::create('dokumen_paket', function (Blueprint $table) {
            $table->id();
            $table->foreignId('paket_id')->constrained('pakets')->cascadeOnDelete();
            $table->foreignId('checklist_dokumen_id')->constrained('checklist_dokumen')->cascadeOnDelete();
            $table->string('status')->default('belum');
            $table->timestamps();

            $table->unique(['paket_id', 'checklist_dokumen_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dokumen_paket');
    }
};
