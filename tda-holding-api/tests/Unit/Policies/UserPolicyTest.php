<?php

namespace Tests\Unit\Policies;

use App\Models\User;
use App\Policies\UserPolicy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * TDA-A01 — règle critique : super_admin ne doit PAS pouvoir toggle un autre admin.
 */
class UserPolicyTest extends TestCase
{
    use RefreshDatabase;

    private UserPolicy $policy;

    protected function setUp(): void
    {
        parent::setUp();
        $this->policy = new UserPolicy();
    }

    public function test_super_admin_can_toggle_client(): void
    {
        $admin = User::factory()->admin()->create();
        $client = User::factory()->create();

        $this->assertTrue($this->policy->toggleStatus($admin, $client));
    }

    public function test_super_admin_cannot_toggle_another_admin(): void
    {
        $admin1 = User::factory()->admin()->create();
        $admin2 = User::factory()->admin()->create();

        $this->assertFalse($this->policy->toggleStatus($admin1, $admin2));
    }

    public function test_super_admin_cannot_toggle_agent(): void
    {
        $admin = User::factory()->admin()->create();
        $agent = User::factory()->agent()->create();

        $this->assertFalse($this->policy->toggleStatus($admin, $agent));
    }

    public function test_super_admin_cannot_toggle_themselves(): void
    {
        $admin = User::factory()->admin()->create();

        $this->assertFalse($this->policy->toggleStatus($admin, $admin));
    }

    public function test_agent_cannot_toggle_anyone(): void
    {
        $agent = User::factory()->agent()->create();
        $client = User::factory()->create();

        $this->assertFalse($this->policy->toggleStatus($agent, $client));
    }

    public function test_client_cannot_toggle_anyone(): void
    {
        $client = User::factory()->create();
        $other = User::factory()->create();

        $this->assertFalse($this->policy->toggleStatus($client, $other));
    }
}
