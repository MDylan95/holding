<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'first_name' => 'Admin',
            'last_name' => 'TDA',
            'email' => 'admin@tda-holding.com',
            'phone' => '+2250000000000',
            'password' => 'password',
            'role' => 'super_admin',
            'is_active' => true,
            'email_verified_at' => now(),
            'city' => 'Abidjan',
            'country' => 'Côte d\'Ivoire',
        ]);
    }
}
