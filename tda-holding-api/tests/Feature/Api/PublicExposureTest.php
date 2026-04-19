<?php

namespace Tests\Feature\Api;

use App\Models\Property;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\CreatesVehicles;
use Tests\TestCase;

/**
 * TDA-A03 — la route publique show() ne doit pas exposer les données
 * personnelles de l'owner (email, phone, address, city, role).
 */
class PublicExposureTest extends TestCase
{
    use CreatesVehicles, RefreshDatabase;

    public function test_vehicle_show_does_not_expose_owner_pii(): void
    {
        $owner = User::factory()->create([
            'email' => 'secret@example.com',
            'phone' => '+2251111111111',
            'address' => '42 rue secrète',
            'city' => 'Abidjan',
        ]);

        $vehicle = $this->createTestVehicle(['owner_id' => $owner->id]);

        $response = $this->getJson("/api/vehicles/{$vehicle->id}")
            ->assertStatus(200);

        $response->assertJsonMissingPath('data.owner');
        $response->assertJsonMissing(['email' => 'secret@example.com']);
        $response->assertJsonMissing(['phone' => '+2251111111111']);
        $response->assertJsonMissing(['address' => '42 rue secrète']);
    }

    public function test_property_show_does_not_expose_owner_pii(): void
    {
        $owner = User::factory()->create([
            'email' => 'leak@example.com',
            'phone' => '+2252222222222',
        ]);
        $category = $this->createVehicleCategory();

        $property = Property::create([
            'category_id' => $category->id,
            'owner_id' => $owner->id,
            'title' => 'Villa 4 pièces',
            'property_type' => 'villa',
            'offer_type' => 'rent',
            'location' => 'Cocody',
            'is_available' => true,
            'status' => 'available',
        ]);

        $response = $this->getJson("/api/properties/{$property->id}")
            ->assertStatus(200);

        $response->assertJsonMissingPath('data.owner');
        $response->assertJsonMissing(['email' => 'leak@example.com']);
        $response->assertJsonMissing(['phone' => '+2252222222222']);
    }
}
