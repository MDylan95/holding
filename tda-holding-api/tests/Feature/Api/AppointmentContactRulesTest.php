<?php

namespace Tests\Feature\Api;

use App\Models\Appointment;
use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\Support\CreatesVehicles;
use Tests\TestCase;

/**
 * TDA-D04 : appointment doit accepter email OU phone (pas les deux requis).
 */
class AppointmentContactRulesTest extends TestCase
{
    use CreatesVehicles, RefreshDatabase;

    private function createVehicle(): Vehicle
    {
        return $this->createTestVehicle(['offer_type' => 'sale']);
    }

    public function test_appointment_with_phone_only_is_accepted(): void
    {
        $vehicle = $this->createVehicle();
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->postJson('/api/v1/appointments', [
            'vehicle_id' => $vehicle->id,
            'appointment_date' => now()->addDays(3)->toDateString(),
            'phone' => '+2250102030405',
        ])->assertStatus(201);

        $appointment = Appointment::where('user_id', $user->id)->firstOrFail();

        $this->assertSame('+2250102030405', $appointment->phone);
        $this->assertNull($appointment->email);
    }

    public function test_appointment_with_email_only_is_accepted(): void
    {
        $vehicle = $this->createVehicle();
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->postJson('/api/v1/appointments', [
            'vehicle_id' => $vehicle->id,
            'appointment_date' => now()->addDays(3)->toDateString(),
            'email' => 'client@example.com',
        ])->assertStatus(201);

        $appointment = Appointment::where('user_id', $user->id)->firstOrFail();

        $this->assertNull($appointment->phone);
        $this->assertSame('client@example.com', $appointment->email);
    }

    public function test_appointment_without_contact_is_rejected(): void
    {
        $vehicle = $this->createVehicle();
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/v1/appointments', [
            'vehicle_id' => $vehicle->id,
            'appointment_date' => now()->addDays(3)->toDateString(),
        ])->assertStatus(422)
          ->assertJsonValidationErrors(['phone', 'email']);
    }
}
