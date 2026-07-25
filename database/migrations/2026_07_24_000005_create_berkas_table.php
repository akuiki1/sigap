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
        // Berkas fisik yang diunggah, polimorfik (attachable) supaya bisa
        // dipakai baik oleh dokumen_paket (checklist administrasi) maupun
        // progres_paket (dokumentasi foto progres fisik) tanpa migrasi baru.
        // Beberapa baris per attachable = riwayat versi; hanya satu yang
        // is_terkini=true di saat bersamaan (versi sebelumnya diarsipkan,
        // bukan dihapus, supaya jejak audit tetap utuh).
        Schema::create('berkas', function (Blueprint $table) {
            $table->id();
            $table->string('attachable_type');
            $table->unsignedBigInteger('attachable_id');

            $table->unsignedSmallInteger('versi')->default(1);
            $table->boolean('is_terkini')->default(true);

            $table->string('file_path');
            $table->string('nama_asli');
            $table->unsignedBigInteger('ukuran');
            $table->string('mime_type');

            // String, bukan enum MySQL, konsisten dengan status di tabel lain —
            // divalidasi lewat App\Enums\StatusVerifikasi.
            $table->string('status_verifikasi')->default('diajukan');
            $table->text('catatan_verifikasi')->nullable();

            $table->foreignId('uploaded_by')->constrained('users');
            $table->foreignId('verified_by')->nullable()->constrained('users');
            $table->timestamp('verified_at')->nullable();

            $table->timestamps();

            $table->index(['attachable_type', 'attachable_id', 'is_terkini']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('berkas');
    }
};
