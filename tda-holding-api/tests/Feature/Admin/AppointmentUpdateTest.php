<?php

namespace Tests\Feature\Admin;

use App\Models\Appointment;
use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\CreatesVehicles;
use Tests\TestCase;

class AppointmentUpdateTest extends TestCase
{
    use CreatesVehicles, RefreshDatabase;

    private function createAppointment(array $overrides = []): Appointment
    {
        $user = $overrides['user'] ?? User::factory()->create();
        $vehicle = $overrides['vehicle'] ?? $this->createTestVehicle(['offer_type' => 'sale']);

        unset($overrides['user'], $overrides['vehicle']);

        return Appointment::create(array_merge([
            'user_id' => $user->id,
            'vehicle_id' => $vehicle->id,
            'appointment_date' => now()->addDays(3)->toDateString(),
            'phone' => '+2250102030405',
            'email' => 'client@example.com',
            'status' => 'pending',
        ], $overrides));
    }

    public function test_updating_admin_notes_does_not_set_confirmation_fields(): void
    {
        $admin = User::factory()->admin()->create();
        $appointment = $this->createAppointment();

        $this->actingAs($admin)
            ->put("/admin/appointments/{$appointment->id}", [
                'status' => 'pending',
                'admin_notes' => 'Client rappelé.',
            ])
            ->assertRedirect();

        $appointment->refresh();

        $this->assertSame('pending', $appointment->status);
        $this->assertSame('Client rappelé.', $appointment->admin_notes);
        $this->assertNull($appointment->confirmed_by);
        $this->assertNull($appointment->confirmed_at);
    }

    public function test_confirming_appointment_sets_confirmation_fields_once(): void
    {
        $admin = User::factory()->admin()->create();
        $appointment = $this->createAppointment();

        $this->actingAs($admin)
            ->put("/admin/appointments/{$appointment->id}", [
                'status' => 'confirmed',
                'admin_notes' => 'Validé.',
            ])
            ->assertRedirect();

        $appointment->refresh();
        $firstConfirmedAt = $appointment->confirmed_at;

        $this->assertSame('confirmed', $appointment->status);
        $this->assertSame($admin->id, $appointment->confirmed_by);
        $this->assertNotNull($firstConfirmedAt);
        $this->assertTrue($appointment->confirmedBy->is($admin));

        $this->actingAs($admin)
            ->put("/admin/appointments/{$appointment->id}", [
                'status' => 'confirmed',
                'admin_notes' => 'Toujours confirmé.',
            ])
            ->assertRedirect();

        $appointment->refresh();

        $this->assertSame($admin->id, $appointment->confirmed_by);
        $this->assertTrue($appointment->confirmed_at->equalTo($firstConfirmedAt));
        $this->assertSame('Toujours confirmé.', $appointment->admin_notes);
    }
}
