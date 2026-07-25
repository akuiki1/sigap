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
        Schema::table('users', function (Blueprint $table) {
            // Peran default = auditor (hanya lihat): pendaftaran mandiri lewat
            // /register tidak boleh langsung memberi hak input. Admin menaikkan
            // peran staf secara manual. String, bukan enum MySQL, agar menambah
            // peran baru tak perlu ALTER TABLE — divalidasi lewat App\Enums\Role.
            $table->string('role')->default('auditor')->after('email');
            $table->index('role');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['role']);
            $table->dropColumn('role');
        });
    }
};
