<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            // Véhicules
            ['name' => 'Berline', 'slug' => 'berline', 'type' => 'vehicle', 'sort_order' => 1],
            ['name' => 'SUV', 'slug' => 'suv', 'type' => 'vehicle', 'sort_order' => 2],
            ['name' => '4x4', 'slug' => '4x4', 'type' => 'vehicle', 'sort_order' => 3],
            ['name' => 'Utilitaire', 'slug' => 'utilitaire', 'type' => 'vehicle', 'sort_order' => 4],
            ['name' => 'Minibus', 'slug' => 'minibus', 'type' => 'vehicle', 'sort_order' => 5],
            ['name' => 'Luxe', 'slug' => 'luxe', 'type' => 'vehicle', 'sort_order' => 6],

            // Immobilier
            ['name' => 'Villa', 'slug' => 'villa', 'type' => 'property', 'sort_order' => 1],
            ['name' => 'Appartement', 'slug' => 'appartement', 'type' => 'property', 'sort_order' => 2],
            ['name' => 'Terrain', 'slug' => 'terrain', 'type' => 'property', 'sort_order' => 3],
            ['name' => 'Duplex', 'slug' => 'duplex', 'type' => 'property', 'sort_order' => 4],
            ['name' => 'Studio', 'slug' => 'studio', 'type' => 'property', 'sort_order' => 5],
            ['name' => 'Maison', 'slug' => 'maison', 'type' => 'property', 'sort_order' => 6],

            // Services
            ['name' => 'Chauffeur', 'slug' => 'chauffeur', 'type' => 'service', 'sort_order' => 1],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
