<?php

namespace Tests\Feature;

use App\Models\Paket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_the_login_page()
    {
        $response = $this->get(route('dashboard'));
        $response->assertRedirect(route('login'));
    }

    public function test_authenticated_users_can_visit_the_dashboard()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $response = $this->get(route('dashboard'));
        $response->assertOk();
    }

    public function test_statistics_count_pakets_per_status(): void
    {
        $this->actingAs(User::factory()->create());

        Paket::factory()->count(3)->aktif()->create();
        Paket::factory()->count(2)->selesai()->create();
        Paket::factory()->count(1)->menungguAudit()->create();

        $this->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(
                fn (AssertableInertia $page) => $page
                    ->component('dashboard')
                    ->where('stats.paket_aktif', 3)
            );
    }

    public function test_statistics_are_zero_when_there_are_no_pakets(): void
    {
        $this->actingAs(User::factory()->create());

        $this->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(
                fn (AssertableInertia $page) => $page
                    ->where('stats.paket_aktif', 0)
                    ->where('stats.dokumen_belum_lengkap', 0)
                    ->has('packages', 0)
            );
    }

    public function test_packages_list_is_scoped_to_the_current_tahun_anggaran(): void
    {
        $this->actingAs(User::factory()->create());

        $tahunIni = Carbon::now()->year;

        Paket::factory()->count(2)->create(['tahun_anggaran' => $tahunIni]);
        Paket::factory()->create(['tahun_anggaran' => $tahunIni - 1]);

        $this->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page->has('packages', 2));
    }
}
