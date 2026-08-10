<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Peran pengawas & auditor dihapus (lihat App\Enums\Role). Barisnya
        // dipetakan ke operator, bukan admin: keduanya dulu tidak berhak
        // mengelola akun, jadi operator adalah padanan yang tidak menaikkan hak.
        DB::table('users')
            ->whereIn('role', ['pengawas', 'auditor'])
            ->update(['role' => 'operator']);

        Schema::table('users', function (Blueprint $table) {
            // Default lama 'auditor' (hanya lihat) sudah tak ada padanannya.
            // Pendaftaran mandiri ditutup, jadi default ini hanya jaring
            // pengaman untuk baris yang dibuat tanpa menyebut peran.
            $table->string('role')->default('operator')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Hanya defaultnya yang bisa dikembalikan. Peran asli baris yang tadi
        // dipetakan sudah tidak tercatat di mana pun — biarkan sebagai operator
        // daripada menebak dan diam-diam salah menurunkan hak seseorang.
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('auditor')->change();
        });
    }
};
