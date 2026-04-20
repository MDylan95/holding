<?php

namespace Tests\Feature\Api;

use App\Models\Driver;
use App\Models\Property;
use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\Support\CreatesVehicles;
use Tests\TestCase;

/**
 * TDA-C02 — vérifie que les FormRequests Vehicle/Property/Driver
 * délèguent l'autorisation aux policies et valident les règles.
 */
class FormRequestsTest extends TestCase
{
    use CreatesVehicles, RefreshDatabase;

    public function test_store_vehicle_requires_agent_or_super_admin(): void
    {
        $category = $this->createVehicleCategory();
        Sanctum::actingAs(User::factory()->create()); // client

        $this->postJson('/api/v1/vehicles', [
            'category_id' => $category->id,
            'brand' => 'Toyota',
            'model' => 'Camry',
            'daily_rate' => 30000,
        ])->assertStatus(403);
    }

    public function test_store_vehicle_validates_required_fields(): void
    {
        Sanctum::actingAs(User::factory()->agent()->create());

        $this->postJson('/api/v1/vehicles', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['category_id', 'brand', 'model']);
    }

    public function test_store_property_rejects_invalid_property_type(): void
    {
        $category = $this->createVehicleCategory();
        Sanctum::actingAs(User::factory()->agent()->create());

        $this->postJson('/api/v1/properties', [
            'category_id' => $category->id,
            'title' => 'Test',
            'property_type' => 'castle', // invalide
            'location' => 'Abidjan',
        ])->assertStatus(422)
          ->assertJsonValidationErrors(['property_type']);
    }

    public function test_store_driver_rejects_duplicate_phone(): void
    {
        Driver::create([
            'first_name' => 'A', 'last_name' => 'B',
            'phone' => '+2250101010101', 'license_number' => 'LIC-A',
            'daily_rate' => 5000, 'status' => 'available', 'is_active' => true,
        ]);

        Sanctum::actingAs(User::factory()->agent()->create());

        $this->postJson('/api/v1/drivers', [
            'first_name' => 'C', 'last_name' => 'D',
            'phone' => '+2250101010101',
            'license_number' => 'LIC-B',
        ])->assertStatus(422)
          ->assertJsonValidationErrors(['phone']);
    }

    public function test_update_vehicle_allows_partial_payload(): void
    {
        $vehicle = $this->createTestVehicle();
        Sanctum::actingAs(User::factory()->agent()->create());

        $this->putJson("/api/v1/vehicles/{$vehicle->id}", [
            'daily_rate' => 99999,
        ])->assertStatus(200);

        $this->assertSame('99999.00', $vehicle->fresh()->daily_rate);
    }
}
