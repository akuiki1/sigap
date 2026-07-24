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
            // Kolom administrasi & kontrak tambahan — dipisah dari migrasi awal
            // karena baru dibutuhkan saat halaman detail paket (kartu "Informasi
            // paket" & linimasa tahapan) mulai menampilkan data sungguhan,
            // bukan lagi contoh statis dari mockup desain.
            $table->string('sumber_dana')->nullable()->after('penyedia');

            // Pagu adalah plafon anggaran (RUP/DPA), berbeda dari nilai_kontrak
            // (nilai hasil pengadaan) — keduanya bisa berbeda nominal.
            $table->unsignedBigInteger('pagu')->nullable()->after('nilai_kontrak');

            $table->string('no_kontrak')->nullable()->after('status');
            $table->string('konsultan_pengawas')->nullable()->after('no_kontrak');
            $table->string('ppk')->nullable()->after('konsultan_pengawas');
            $table->string('pptk')->nullable()->after('ppk');

            // Tanggal tahapan administrasi konstruksi (linimasa Kontrak → SPMK
            // → MC-0 → PHO). FHO sengaja tidak diberi kolom tanggal rencana:
            // baru relevan setelah PHO terbit dan masa pemeliharaan berjalan.
            $table->date('tanggal_kontrak')->nullable()->after('tanggal_selesai');
            $table->date('tanggal_spmk')->nullable()->after('tanggal_kontrak');
            $table->date('tanggal_mc0')->nullable()->after('tanggal_spmk');
            $table->date('tanggal_pho_rencana')->nullable()->after('tanggal_mc0');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pakets', function (Blueprint $table) {
            $table->dropColumn([
                'sumber_dana',
                'pagu',
                'no_kontrak',
                'konsultan_pengawas',
                'ppk',
                'pptk',
                'tanggal_kontrak',
                'tanggal_spmk',
                'tanggal_mc0',
                'tanggal_pho_rencana',
            ]);
        });
    }
};
