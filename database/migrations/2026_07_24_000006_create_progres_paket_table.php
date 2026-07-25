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
        // Riwayat progres fisik proyek dari waktu ke waktu — menjawab "gedung
        // ini waktu 20% bentuknya gimana", berbeda dari pakets.progres yang
        // cuma menyimpan angka terkini. Foto pendukung nempel lewat tabel
        // berkas (attachable), bisa lebih dari satu per entri (beberapa
        // sudut), karena itu bukan model versi/revisi seperti dokumen
        // checklist — semua foto dalam satu entri sama-sama berlaku.
        Schema::create('progres_paket', function (Blueprint $table) {
            $table->id();
            $table->foreignId('paket_id')->constrained('pakets')->cascadeOnDelete();
            $table->date('tanggal');
            $table->unsignedTinyInteger('persentase');
            $table->text('keterangan')->nullable();

            // Verifikasi klaim persentase (didukung foto), bukan verifikasi
            // per-foto — karena itu dilacak di sini, terpisah dari
            // berkas.status_verifikasi milik masing-masing foto.
            $table->string('status_verifikasi')->default('diajukan');
            $table->text('catatan_verifikasi')->nullable();

            $table->foreignId('dilaporkan_by')->constrained('users');
            $table->foreignId('diverifikasi_by')->nullable()->constrained('users');
            $table->timestamp('diverifikasi_pada')->nullable();

            $table->timestamps();

            $table->index(['paket_id', 'tanggal']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('progres_paket');
    }
};
