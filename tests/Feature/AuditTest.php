<?php

namespace Tests\Feature;

use App\Models\Paket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class AuditTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_the_login_page(): void
    {
        $this->get(route('audit.review'))->assertRedirect(route('login'));
    }

    public function test_only_pakets_awaiting_audit_are_listed(): void
    {
        $this->actingAs(User::factory()->create());

        $menunggu = Paket::factory()->menungguAudit()->create();
        Paket::factory()->count(4)->aktif()->create();
        Paket::factory()->count(2)->selesai()->create();

        $this->get(route('audit.review'))
            ->assertOk()
            ->assertInertia(
                fn (AssertableInertia $page) => $page
                    ->component('audit/review')
                    ->has('pakets', 1)
                    ->where('pakets.0.id', $menunggu->id)
            );
    }

    public function test_page_renders_when_nothing_awaits_audit(): void
    {
        $this->actingAs(User::factory()->create());
        Paket::factory()->count(3)->aktif()->create();

        $this->get(route('audit.review'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page->has('pakets', 0));
    }
}
