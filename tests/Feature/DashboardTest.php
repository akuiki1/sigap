<?php

namespace Tests\Feature;

use App\Models\Paket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
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
                    ->where('stats.total_paket', 6)
                    ->where('stats.proyek_aktif', 3)
                    ->where('stats.selesai', 2)
                    ->where('stats.menunggu_audit', 1)
            );
    }

    public function test_statistics_are_zero_when_there_are_no_pakets(): void
    {
        $this->actingAs(User::factory()->create());

        $this->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(
                fn (AssertableInertia $page) => $page
                    ->where('stats.total_paket', 0)
                    ->where('stats.proyek_aktif', 0)
                    ->has('pakets', 0)
            );
    }

    public function test_only_the_five_most_recent_pakets_are_listed(): void
    {
        $this->actingAs(User::factory()->create());
        Paket::factory()->count(8)->create();

        $this->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page->has('pakets', 5));
    }
}
