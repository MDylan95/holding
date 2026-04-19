<?php

namespace Tests\Unit\Services;

use App\Exceptions\InvalidBookingTransitionException;
use App\Models\Booking;
use App\Models\Driver;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Vehicle;
use App\Services\BookingWorkflow;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\CreatesVehicles;
use Tests\TestCase;

/**
 * TDA-B01 — couvre les transitions et les effets de bord du BookingWorkflow.
 */
class BookingWorkflowTest extends TestCase
{
    use CreatesVehicles, RefreshDatabase;

    private BookingWorkflow $workflow;

    protected function setUp(): void
    {
        parent::setUp();
        $this->workflow = new BookingWorkflow();
    }

    private function pendingBooking(array $overrides = []): Booking
    {
        $client = User::factory()->create();
        $vehicle = $this->createTestVehicle();

        return Booking::create(array_merge([
            'user_id' => $client->id,
            'bookable_type' => 'vehicle',
            'bookable_id' => $vehicle->id,
            'start_date' => now()->addDay(),
            'end_date' => now()->addDays(3),
            'total_amount' => 75000,
            'status' => 'pending',
        ], $overrides));
    }

    public function test_confirm_locks_bookable_and_creates_transaction(): void
    {
        $booking = $this->pendingBooking();
        $admin = User::factory()->admin()->create();

        $this->workflow->confirm($booking, $admin);

        $booking->refresh();
        $this->assertSame('confirmed', $booking->status);
        $this->assertSame($admin->id, $booking->confirmed_by);

        $vehicle = $booking->bookable()->first();
        $this->assertSame('rented', $vehicle->status);
        $this->assertFalse($vehicle->is_available);

        $this->assertSame(1, $booking->transactions()->count());
        $this->assertSame('pending', $booking->transactions()->first()->status);
    }

    public function test_confirm_does_not_duplicate_transaction(): void
    {
        $booking = $this->pendingBooking();
        $admin = User::factory()->admin()->create();

        Transaction::create([
            'booking_id' => $booking->id,
            'user_id' => $booking->user_id,
            'amount' => $booking->total_amount,
            'payment_method' => 'cash',
            'type' => 'full_payment',
            'status' => 'pending',
        ]);

        $this->workflow->confirm($booking, $admin);

        $this->assertSame(1, $booking->transactions()->count());
    }

    public function test_confirm_throws_when_not_pending(): void
    {
        $booking = $this->pendingBooking(['status' => 'confirmed']);
        $admin = User::factory()->admin()->create();

        $this->expectException(InvalidBookingTransitionException::class);
        $this->workflow->confirm($booking, $admin);
    }

    public function test_confirm_locks_driver_when_with_driver(): void
    {
        $driver = Driver::create([
            'first_name' => 'Jean', 'last_name' => 'Kouassi',
            'phone' => '+2250707070707', 'license_number' => 'LIC-1',
            'daily_rate' => 5000, 'status' => 'available', 'is_active' => true,
        ]);
        $booking = $this->pendingBooking(['with_driver' => true, 'driver_id' => $driver->id]);
        $admin = User::factory()->admin()->create();

        $this->workflow->confirm($booking, $admin);

        $this->assertSame('on_mission', $driver->fresh()->status);
    }

    public function test_cancel_releases_bookable_when_confirmed(): void
    {
        $booking = $this->pendingBooking();
        $admin = User::factory()->admin()->create();
        $this->workflow->confirm($booking, $admin);

        $this->workflow->cancel($booking, 'Changement de programme', $booking->user);

        $booking->refresh();
        $this->assertSame('cancelled', $booking->status);
        $this->assertSame('Changement de programme', $booking->cancellation_reason);

        $vehicle = $booking->bookable()->first();
        $this->assertSame('available', $vehicle->status);
        $this->assertTrue($vehicle->is_available);
    }

    public function test_client_cannot_cancel_in_progress(): void
    {
        $booking = $this->pendingBooking(['status' => 'in_progress']);

        $this->expectException(InvalidBookingTransitionException::class);
        $this->workflow->cancel($booking, null, $booking->user);
    }

    public function test_admin_can_cancel_in_progress(): void
    {
        $booking = $this->pendingBooking(['status' => 'in_progress']);
        $admin = User::factory()->admin()->create();

        $result = $this->workflow->cancel($booking, 'Incident', $admin);

        $this->assertSame('cancelled', $result->status);
    }

    public function test_cancel_rejected_throws(): void
    {
        $booking = $this->pendingBooking(['status' => 'rejected']);

        $this->expectException(InvalidBookingTransitionException::class);
        $this->workflow->cancel($booking, null, User::factory()->admin()->create());
    }

    public function test_reject_marks_booking_rejected(): void
    {
        $booking = $this->pendingBooking();
        $admin = User::factory()->admin()->create();

        $this->workflow->reject($booking, 'Bien non conforme', $admin);

        $booking->refresh();
        $this->assertSame('rejected', $booking->status);
        $this->assertSame('Bien non conforme', $booking->rejection_reason);
        $this->assertSame($admin->id, $booking->rejected_by);
    }

    public function test_reject_non_pending_throws(): void
    {
        $booking = $this->pendingBooking(['status' => 'confirmed']);

        $this->expectException(InvalidBookingTransitionException::class);
        $this->workflow->reject($booking, 'x', User::factory()->admin()->create());
    }

    public function test_start_requires_confirmed(): void
    {
        $booking = $this->pendingBooking();
        $this->expectException(InvalidBookingTransitionException::class);
        $this->workflow->start($booking);
    }

    public function test_start_transitions_to_in_progress(): void
    {
        $booking = $this->pendingBooking(['status' => 'confirmed']);

        $this->workflow->start($booking);

        $this->assertSame('in_progress', $booking->fresh()->status);
    }

    public function test_complete_releases_bookable(): void
    {
        $booking = $this->pendingBooking(['status' => 'confirmed']);
        /** @var Vehicle $vehicle */
        $vehicle = $booking->bookable()->first();
        $vehicle->markAsRented();

        $this->workflow->complete($booking);

        $booking->refresh();
        $this->assertSame('completed', $booking->status);

        $vehicle->refresh();
        $this->assertSame('available', $vehicle->status);
        $this->assertTrue($vehicle->is_available);
    }

    public function test_complete_non_confirmed_throws(): void
    {
        $booking = $this->pendingBooking();
        $this->expectException(InvalidBookingTransitionException::class);
        $this->workflow->complete($booking);
    }
}
