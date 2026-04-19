<?php

namespace Tests\Unit\Policies;

use App\Models\Booking;
use App\Models\User;
use App\Policies\BookingPolicy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * TDA-A01 — couverture policy × 3 rôles × (propriétaire / non-propriétaire).
 */
class BookingPolicyTest extends TestCase
{
    use RefreshDatabase;

    private BookingPolicy $policy;

    protected function setUp(): void
    {
        parent::setUp();
        $this->policy = new BookingPolicy();
    }

    private function makeBooking(User $owner): Booking
    {
        return new Booking(['user_id' => $owner->id]);
    }

    public function test_super_admin_can_view_any_booking(): void
    {
        $owner = User::factory()->create();
        $admin = User::factory()->admin()->create();
        $booking = $this->makeBooking($owner);

        $this->assertTrue($this->policy->view($admin, $booking));
        $this->assertTrue($this->policy->confirm($admin, $booking));
        $this->assertTrue($this->policy->complete($admin, $booking));
    }

    public function test_agent_can_view_any_and_confirm(): void
    {
        $owner = User::factory()->create();
        $agent = User::factory()->agent()->create();
        $booking = $this->makeBooking($owner);

        $this->assertTrue($this->policy->view($agent, $booking));
        $this->assertTrue($this->policy->confirm($agent, $booking));
    }

    public function test_owner_client_can_view_and_cancel_own(): void
    {
        $owner = User::factory()->create();
        $booking = $this->makeBooking($owner);

        $this->assertTrue($this->policy->view($owner, $booking));
        $this->assertTrue($this->policy->cancel($owner, $booking));
    }

    public function test_other_client_cannot_view(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $booking = $this->makeBooking($owner);

        $this->assertFalse($this->policy->view($other, $booking));
        $this->assertFalse($this->policy->cancel($other, $booking));
    }

    public function test_client_cannot_confirm_or_reject(): void
    {
        $client = User::factory()->create();
        $booking = $this->makeBooking($client);

        $this->assertFalse($this->policy->confirm($client, $booking));
        $this->assertFalse($this->policy->reject($client, $booking));
        $this->assertFalse($this->policy->complete($client, $booking));
        $this->assertFalse($this->policy->start($client, $booking));
    }
}
