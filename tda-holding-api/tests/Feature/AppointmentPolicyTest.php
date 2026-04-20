<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\Support\CreatesVehicles;
use Tests\TestCase;

/**
 * TDA-Q01 — régression : AppointmentPolicy doit utiliser isAdmin().
 */
class AppointmentPolicyTest extends TestCase
{
    use CreatesVehicles, RefreshDatabase;

    private function makeAppointmentForUser(User $user): Appointment
    {
        $vehicle = $this->createTestVehicle(['offer_type' => 'sale']);

        return Appointment::create([
            'user_id' => $user->id,
            'vehicle_id' => $vehicle->id,
            'appointment_date' => now()->addDays(3)->toDateString(),
            'phone' => '+2250000000001',
            'email' => 'client@example.com',
            'status' => 'pending',
        ]);
    }

    public function test_owner_can_view_own_appointment(): void
    {
        $owner = User::factory()->create();
        $appointment = $this->makeAppointmentForUser($owner);

        Sanctum::actingAs($owner);

        $this->getJson("/api/v1/appointments/{$appointment->id}")
            ->assertStatus(200);
    }

    public function test_super_admin_can_view_any_appointment(): void
    {
        $owner = User::factory()->create();
        $admin = User::factory()->admin()->create();
        $appointment = $this->makeAppointmentForUser($owner);

        Sanctum::actingAs($admin);

        $this->getJson("/api/v1/appointments/{$appointment->id}")
            ->assertStatus(200);
    }

    public function test_agent_can_view_any_appointment(): void
    {
        $owner = User::factory()->create();
        $agent = User::factory()->agent()->create();
        $appointment = $this->makeAppointmentForUser($owner);

        Sanctum::actingAs($agent);

        $this->getJson("/api/v1/appointments/{$appointment->id}")
            ->assertStatus(200);
    }

    public function test_other_client_cannot_view_appointment(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $appointment = $this->makeAppointmentForUser($owner);

        Sanctum::actingAs($other);

        $this->getJson("/api/v1/appointments/{$appointment->id}")
            ->assertStatus(403);
    }
}
