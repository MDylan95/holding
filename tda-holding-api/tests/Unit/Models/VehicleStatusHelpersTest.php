<?php

namespace Tests\Unit\Models;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\CreatesVehicles;
use Tests\TestCase;

/**
 * TDA-E03 : les helpers Vehicle::markAs* doivent être symétriques à Property.
 */
class VehicleStatusHelpersTest extends TestCase
{
    use CreatesVehicles, RefreshDatabase;

    public function test_mark_as_sold_sets_status_and_availability(): void
    {
        $vehicle = $this->createTestVehicle();

        $vehicle->markAsSold();

        $this->assertSame('sold', $vehicle->fresh()->status);
        $this->assertFalse($vehicle->fresh()->is_available);
    }

    public function test_mark_as_maintenance_sets_status_and_availability(): void
    {
        $vehicle = $this->createTestVehicle();

        $vehicle->markAsMaintenance();

        $this->assertSame('maintenance', $vehicle->fresh()->status);
        $this->assertFalse($vehicle->fresh()->is_available);
    }

    public function test_mark_as_available_reopens_vehicle(): void
    {
        $vehicle = $this->createTestVehicle(['status' => 'rented', 'is_available' => false]);

        $vehicle->markAsAvailable();

        $this->assertSame('available', $vehicle->fresh()->status);
        $this->assertTrue($vehicle->fresh()->is_available);
    }
}
