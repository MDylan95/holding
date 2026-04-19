<?php

namespace Tests\Support;

use App\Models\Category;
use App\Models\Vehicle;

trait CreatesVehicles
{
    protected function createVehicleCategory(): Category
    {
        return Category::firstOrCreate(
            ['slug' => 'test-category'],
            ['name' => 'Test Category', 'type' => 'vehicle', 'is_active' => true]
        );
    }

    protected function createTestVehicle(array $overrides = []): Vehicle
    {
        $category = $this->createVehicleCategory();

        return Vehicle::create(array_merge([
            'category_id' => $category->id,
            'brand' => 'Toyota',
            'model' => 'Corolla',
            'year' => 2022,
            'daily_rate' => 25000,
            'offer_type' => 'rent',
            'status' => 'available',
            'is_available' => true,
        ], $overrides));
    }
}
