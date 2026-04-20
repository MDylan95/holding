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
 * TDA-B03 : l'overlap check doit inclure 'in_progress'.
 * TDA-B04 : un bien offer_type=sale ne doit pas être réservable en location.
 */
class BookingCreationRulesTest extends TestCase
{
    use CreatesVehicles, RefreshDatabase;

    private function createVehicle(array $overrides = []): Vehicle
    {
        return $this->createTestVehicle($overrides);
    }

    public function test_vehicle_for_sale_only_cannot_be_booked(): void
    {
        $vehicle = $this->createVehicle(['offer_type' => 'sale']);
        $client = User::factory()->create();
        Sanctum::actingAs($client);

        $this->postJson('/api/v1/bookings', [
            'bookable_type' => 'vehicle',
            'bookable_id' => $vehicle->id,
            'start_date' => now()->addDay()->toDateString(),
            'end_date' => now()->addDays(3)->toDateString(),
        ])->assertStatus(422)
          ->assertJsonFragment(['message' => 'Ce bien n\'est pas disponible à la location.']);
    }

    public function test_vehicle_for_both_can_be_booked(): void
    {
        $vehicle = $this->createVehicle(['offer_type' => 'both']);
        $client = User::factory()->create();
        Sanctum::actingAs($client);

        $this->postJson('/api/v1/bookings', [
            'bookable_type' => 'vehicle',
            'bookable_id' => $vehicle->id,
            'start_date' => now()->addDay()->toDateString(),
            'end_date' => now()->addDays(3)->toDateString(),
        ])->assertStatus(201);
    }

    public function test_overlap_check_includes_in_progress(): void
    {
        $vehicle = $this->createVehicle();
        $client = User::factory()->create();

        // Réservation en cours existante
        Booking::create([
            'user_id' => $client->id,
            'bookable_type' => 'vehicle',
            'bookable_id' => $vehicle->id,
            'start_date' => now()->addDay()->toDateString(),
            'end_date' => now()->addDays(5)->toDateString(),
            'total_amount' => 100000,
            'status' => 'in_progress',
        ]);

        Sanctum::actingAs($client);

        $this->postJson('/api/v1/bookings', [
            'bookable_type' => 'vehicle',
            'bookable_id' => $vehicle->id,
            'start_date' => now()->addDays(2)->toDateString(),
            'end_date' => now()->addDays(4)->toDateString(),
        ])->assertStatus(422)
          ->assertJsonFragment(['message' => 'Ce bien est déjà réservé sur cette période.']);
    }
}
