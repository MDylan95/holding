<?php

namespace Tests\Feature\Api;

use App\Models\Category;
use App\Models\Property;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\Support\CreatesVehicles;
use Tests\TestCase;

/**
 * TDA-A02 — les agents ne doivent PAS pouvoir supprimer les ressources
 * ni gérer les catégories. Seul super_admin peut.
 */
class RoleSeparationTest extends TestCase
{
    use CreatesVehicles, RefreshDatabase;

    public function test_agent_cannot_delete_vehicle(): void
    {
        $vehicle = $this->createTestVehicle();
        Sanctum::actingAs(User::factory()->agent()->create());

        $this->deleteJson("/api/v1/vehicles/{$vehicle->id}")
            ->assertStatus(403);
    }

    public function test_super_admin_can_delete_vehicle(): void
    {
        $vehicle = $this->createTestVehicle();
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->deleteJson("/api/v1/vehicles/{$vehicle->id}")
            ->assertStatus(200);
    }

    public function test_agent_cannot_delete_property(): void
    {
        $category = $this->createVehicleCategory();
        $property = Property::create([
            'category_id' => $category->id,
            'title' => 'Villa',
            'property_type' => 'villa',
            'offer_type' => 'rent',
            'location' => 'Abidjan',
            'is_available' => true,
            'status' => 'available',
        ]);

        Sanctum::actingAs(User::factory()->agent()->create());

        $this->deleteJson("/api/v1/properties/{$property->id}")
            ->assertStatus(403);
    }

    public function test_agent_cannot_create_category(): void
    {
        Sanctum::actingAs(User::factory()->agent()->create());

        $this->postJson('/api/v1/categories', [
            'name' => 'Test',
            'type' => 'vehicle',
        ])->assertStatus(403);
    }

    public function test_super_admin_can_create_category(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->postJson('/api/v1/categories', [
            'name' => 'Berline',
            'type' => 'vehicle',
        ])->assertStatus(201);
    }

    public function test_agent_cannot_delete_category(): void
    {
        $category = Category::create(['name' => 'X', 'slug' => 'x', 'type' => 'vehicle']);
        Sanctum::actingAs(User::factory()->agent()->create());

        $this->deleteJson("/api/v1/categories/{$category->id}")
            ->assertStatus(403);
    }

    public function test_client_cannot_access_admin_routes(): void
    {
        $vehicle = $this->createTestVehicle();
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/v1/categories', ['name' => 'X', 'type' => 'vehicle'])
            ->assertStatus(403);

        $this->deleteJson("/api/v1/vehicles/{$vehicle->id}")
            ->assertStatus(403);
    }

    public function test_agent_can_create_vehicle(): void
    {
        $category = $this->createVehicleCategory();
        Sanctum::actingAs(User::factory()->agent()->create());

        $this->postJson('/api/v1/vehicles', [
            'category_id' => $category->id,
            'brand' => 'Ford',
            'model' => 'Focus',
            'daily_rate' => 20000,
            'offer_type' => 'rent',
        ])->assertStatus(201);
    }
}
