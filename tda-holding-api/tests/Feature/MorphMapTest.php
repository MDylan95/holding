<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Favorite;
use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\Support\CreatesVehicles;
use Tests\TestCase;

/**
 * TDA-C01 — la morph map enregistre bien les alias et toutes les créations via API
 * stockent 'vehicle' / 'property' (pas le FQCN) en base.
 */
class MorphMapTest extends TestCase
{
    use CreatesVehicles, RefreshDatabase;

    public function test_morph_map_is_registered(): void
    {
        $this->assertSame(Vehicle::class, Relation::getMorphedModel('vehicle'));
        $this->assertSame(\App\Models\Property::class, Relation::getMorphedModel('property'));
    }

    public function test_booking_store_persists_alias_not_fqcn(): void
    {
        $vehicle = $this->createTestVehicle();
        $client = User::factory()->create();
        Sanctum::actingAs($client);

        $this->postJson('/api/bookings', [
            'bookable_type' => 'vehicle',
            'bookable_id' => $vehicle->id,
            'start_date' => now()->addDay()->toDateString(),
            'end_date' => now()->addDays(2)->toDateString(),
        ])->assertStatus(201);

        $booking = Booking::first();
        $this->assertSame('vehicle', $booking->bookable_type);
    }

    public function test_favorite_toggle_persists_alias(): void
    {
        $vehicle = $this->createTestVehicle();
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/favorites/toggle', [
            'favorable_type' => 'vehicle',
            'favorable_id' => $vehicle->id,
        ])->assertStatus(201);

        $this->assertSame('vehicle', Favorite::first()->favorable_type);
    }

    public function test_booking_bookable_relation_resolves_via_alias(): void
    {
        $vehicle = $this->createTestVehicle();
        $client = User::factory()->create();
        $booking = Booking::create([
            'user_id' => $client->id,
            'bookable_type' => 'vehicle',
            'bookable_id' => $vehicle->id,
            'start_date' => now()->addDay(),
            'end_date' => now()->addDays(2),
            'total_amount' => 30000,
            'status' => 'pending',
        ]);

        $this->assertInstanceOf(Vehicle::class, $booking->bookable);
        $this->assertSame($vehicle->id, $booking->bookable->id);
    }
}
