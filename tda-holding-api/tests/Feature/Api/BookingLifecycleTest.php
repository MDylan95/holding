<?php

namespace Tests\Feature\Api;

use App\Models\Booking;
use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\Support\CreatesVehicles;
use Tests\TestCase;

/**
 * TDA-B01 — validation end-to-end : les canaux Api\ et Admin\ produisent
 * le MÊME état final après confirmation (critère d'acceptation Winston).
 */
class BookingLifecycleTest extends TestCase
{
    use CreatesVehicles, RefreshDatabase;

    private function createPendingBooking(Vehicle $vehicle, User $client): Booking
    {
        return Booking::create([
            'user_id' => $client->id,
            'bookable_type' => 'vehicle',
            'bookable_id' => $vehicle->id,
            'start_date' => now()->addDay(),
            'end_date' => now()->addDays(3),
            'total_amount' => 50000,
            'status' => 'pending',
        ]);
    }

    public function test_api_confirm_creates_transaction_and_locks_vehicle(): void
    {
        $client = User::factory()->create();
        $admin = User::factory()->admin()->create();
        $vehicle = $this->createTestVehicle();
        $booking = $this->createPendingBooking($vehicle, $client);

        Sanctum::actingAs($admin);

        $this->postJson("/api/v1/bookings/{$booking->id}/confirm")
            ->assertStatus(200)
            ->assertJsonFragment(['message' => 'Réservation confirmée.']);

        $booking->refresh();
        $vehicle->refresh();

        $this->assertSame('confirmed', $booking->status);
        $this->assertSame('rented', $vehicle->status);
        $this->assertFalse($vehicle->is_available);
        $this->assertSame(1, $booking->transactions()->count());
        $this->assertSame('pending', $booking->transactions()->first()->status);
    }

    public function test_api_cancel_by_admin_releases_vehicle(): void
    {
        $client = User::factory()->create();
        $admin = User::factory()->admin()->create();
        $vehicle = $this->createTestVehicle();
        $booking = $this->createPendingBooking($vehicle, $client);

        Sanctum::actingAs($admin);
        $this->postJson("/api/v1/bookings/{$booking->id}/confirm")->assertStatus(200);

        $this->postJson("/api/v1/bookings/{$booking->id}/cancel", ['reason' => 'test'])
            ->assertStatus(200);

        $vehicle->refresh();
        $this->assertSame('available', $vehicle->status);
        $this->assertTrue($vehicle->is_available);
    }

    public function test_api_complete_releases_vehicle_and_is_available_true(): void
    {
        $client = User::factory()->create();
        $admin = User::factory()->admin()->create();
        $vehicle = $this->createTestVehicle();
        $booking = $this->createPendingBooking($vehicle, $client);

        Sanctum::actingAs($admin);
        $this->postJson("/api/v1/bookings/{$booking->id}/confirm")->assertStatus(200);
        $this->postJson("/api/v1/bookings/{$booking->id}/complete")->assertStatus(200);

        $vehicle->refresh();
        $this->assertSame('available', $vehicle->status);
        $this->assertTrue($vehicle->is_available);
    }

    public function test_api_reject_does_not_create_transaction(): void
    {
        $client = User::factory()->create();
        $admin = User::factory()->admin()->create();
        $vehicle = $this->createTestVehicle();
        $booking = $this->createPendingBooking($vehicle, $client);

        Sanctum::actingAs($admin);

        $this->postJson("/api/v1/bookings/{$booking->id}/reject", ['reason' => 'KO'])
            ->assertStatus(200);

        $booking->refresh();
        $this->assertSame('rejected', $booking->status);
        $this->assertSame(0, $booking->transactions()->count());
    }

    public function test_client_cancelling_own_pending_booking_succeeds(): void
    {
        $client = User::factory()->create();
        $vehicle = $this->createTestVehicle();
        $booking = $this->createPendingBooking($vehicle, $client);

        Sanctum::actingAs($client);

        $this->postJson("/api/v1/bookings/{$booking->id}/cancel")
            ->assertStatus(200);

        $this->assertSame('cancelled', $booking->fresh()->status);
    }

    public function test_confirming_non_pending_returns_422(): void
    {
        $client = User::factory()->create();
        $admin = User::factory()->admin()->create();
        $vehicle = $this->createTestVehicle();
        $booking = $this->createPendingBooking($vehicle, $client);
        $booking->update(['status' => 'confirmed']);

        Sanctum::actingAs($admin);

        $this->postJson("/api/v1/bookings/{$booking->id}/confirm")
            ->assertStatus(422)
            ->assertJsonFragment(['message' => 'Cette réservation ne peut pas être confirmée.']);
    }
}
