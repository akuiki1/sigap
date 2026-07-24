<?php

namespace Database\Seeders;

use App\Models\Paket;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        // Sebaran status dibuat eksplisit agar kartu statistik dashboard dan
        // mode audit langsung punya data yang bisa dilihat setelah seeding.
        Paket::factory()->count(12)->aktif()->create();
        Paket::factory()->count(6)->selesai()->create();
        Paket::factory()->count(4)->menungguAudit()->create();
    }
}
