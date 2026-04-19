<?php

namespace Tests\Feature\Api;

use App\Models\Category;
use App\Models\Property;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/**
 * TDA-D02 : le statut "maintenance" est accepté sur Property.
 */
class PropertyMaintenanceStatusTest extends TestCase
{
    use RefreshDatabase;

    private function createProperty(): Property
    {
        $category = Category::firstOrCreate(
            ['slug' => 'test-property-category'],
            ['name' => 'Test Property', 'type' => 'property', 'is_active' => true]
        );

        return Property::create([
            'category_id' => $category->id,
            'title' => 'Villa test',
            'property_type' => 'villa',
            'offer_type' => 'rent',
            'location' => 'Abidjan',
            'status' => 'available',
            'is_available' => true,
        ]);
    }

    public function test_maintenance_status_is_accepted_by_update_endpoint(): void
    {
        $admin = User::factory()->admin()->create();
        $property = $this->createProperty();

        Sanctum::actingAs($admin);

        $this->putJson("/api/properties/{$property->id}", [
            'status' => 'maintenance',
        ])->assertStatus(200);

        $this->assertSame('maintenance', $property->fresh()->status);
    }

    public function test_mark_as_maintenance_helper_flips_availability(): void
    {
        $property = $this->createProperty();

        $property->markAsMaintenance();

        $this->assertSame('maintenance', $property->fresh()->status);
        $this->assertFalse($property->fresh()->is_available);
    }

    public function test_invalid_status_is_rejected(): void
    {
        $admin = User::factory()->admin()->create();
        $property = $this->createProperty();

        Sanctum::actingAs($admin);

        $this->putJson("/api/properties/{$property->id}", [
            'status' => 'bogus',
        ])->assertStatus(422)->assertJsonValidationErrors(['status']);
    }
}
