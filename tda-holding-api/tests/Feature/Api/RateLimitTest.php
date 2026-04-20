<?php

namespace Tests\Feature\Api;

use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\Support\CreatesVehicles;
use Tests\TestCase;

/**
 * TDA-A04 — le rate-limiter 'api-create' doit kicker au 11e POST/min.
 */
class RateLimitTest extends TestCase
{
    use CreatesVehicles, RefreshDatabase;

    public function test_booking_creation_is_rate_limited(): void
    {
        $vehicle = $this->createTestVehicle();
        $client = User::factory()->create();
        Sanctum::actingAs($client);

        $payload = [
            'bookable_type' => 'vehicle',
            'bookable_id' => $vehicle->id,
            'start_date' => now()->addDay()->toDateString(),
            'end_date' => now()->addDays(2)->toDateString(),
        ];

        // 10 premières requêtes : ≤ 429 acceptable (201 ou 422, pas 429).
        for ($i = 0; $i < 10; $i++) {
            $response = $this->postJson('/api/v1/bookings', $payload);
            $this->assertNotSame(429, $response->status(), "Requête {$i} a reçu 429 prématurément.");
        }

        // 11e requête : 429 attendu.
        $this->postJson('/api/v1/bookings', $payload)->assertStatus(429);
    }
}
