<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * TDA-E02 : sans flow de vérification email opérationnel, un admin non-vérifié
 * doit pouvoir accéder au back-office.
 */
class AdminAccessWithoutVerificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_unverified_super_admin_can_reach_dashboard(): void
    {
        $admin = User::factory()->admin()->unverified()->create();

        $this->actingAs($admin)
            ->get('/admin/dashboard')
            ->assertStatus(200);
    }

    public function test_client_still_gets_403_on_admin_dashboard(): void
    {
        $client = User::factory()->create(['role' => 'client', 'email_verified_at' => null]);

        $this->actingAs($client)
            ->get('/admin/dashboard')
            ->assertStatus(403);
    }
}
