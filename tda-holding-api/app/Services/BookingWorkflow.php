<?php

namespace App\Services;

use App\Exceptions\InvalidBookingTransitionException;
use App\Models\Booking;
use App\Models\Property;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Vehicle;
use App\Notifications\BookingCancelled;
use App\Notifications\BookingCompleted;
use App\Notifications\BookingConfirmed;
use App\Notifications\BookingRejected;
use Illuminate\Support\Facades\DB;

/**
 * ADR-009 — BookingWorkflow
 *
 * Encapsule toutes les transitions d'état d'une Booking et leurs effets de bord
 * (verrouillage du bookable, du driver, création auto de la transaction pending,
 * notifications). Les contrôleurs Api\ et Admin\ deviennent de simples orchestrateurs HTTP.
 *
 * Toutes les transitions sont atomiques (DB::transaction).
 */
class BookingWorkflow
{
    /**
     * Passage pending -> confirmed.
     * Effets : verrouille le bien, le driver, crée la transaction pending si absente, notifie le client.
     */
    public function confirm(Booking $booking, User $admin): Booking
    {
        if (!$booking->isPending()) {
            throw new InvalidBookingTransitionException('Cette réservation ne peut pas être confirmée.');
        }

        DB::transaction(function () use ($booking, $admin) {
            $booking->confirm($admin->id);
            $this->lockBookable($booking);
            $this->lockDriver($booking);
            $this->ensurePendingTransaction($booking);
        });

        $booking->user?->notify(new BookingConfirmed($booking));

        return $booking->fresh()->load(['bookable', 'driver']);
    }

    /**
     * Annulation. Peut être appelée par le client (sa propre réservation) ou par l'admin.
     * Effets : libère le bien, le driver, notifie.
     */
    public function cancel(Booking $booking, ?string $reason, User $actor): Booking
    {
        if (in_array($booking->status, ['completed', 'cancelled', 'rejected'], true)) {
            throw new InvalidBookingTransitionException('Cette réservation ne peut pas être annulée.');
        }

        if ($booking->status === 'in_progress' && $actor->isClient()) {
            throw new InvalidBookingTransitionException('Une réservation en cours ne peut pas être annulée par le client.');
        }

        DB::transaction(function () use ($booking, $reason) {
            // Libérer le bien + chauffeur seulement si réservation active
            if (in_array($booking->status, ['confirmed', 'in_progress'], true)) {
                $this->releaseBookable($booking);
                $this->releaseDriver($booking);
            }

            $booking->cancel($reason);
        });

        $booking->user?->notify(new BookingCancelled($booking));

        return $booking->fresh()->load(['bookable', 'driver']);
    }

    /**
     * Rejet admin (pending -> rejected).
     */
    public function reject(Booking $booking, string $reason, User $admin): Booking
    {
        if (!$booking->isPending()) {
            throw new InvalidBookingTransitionException('Seules les réservations en attente peuvent être rejetées.');
        }

        DB::transaction(function () use ($booking, $reason, $admin) {
            $booking->reject($reason, $admin->id);
        });

        $booking->user?->notify(new BookingRejected($booking));

        return $booking->fresh();
    }

    /**
     * Démarrage confirmed -> in_progress.
     */
    public function start(Booking $booking): Booking
    {
        if ($booking->status !== 'confirmed') {
            throw new InvalidBookingTransitionException('Seules les réservations confirmées peuvent être démarrées.');
        }

        DB::transaction(function () use ($booking) {
            $booking->update(['status' => 'in_progress']);
        });

        return $booking->fresh()->load(['bookable', 'driver']);
    }

    /**
     * Complétion confirmed/in_progress -> completed.
     * Effets : libère le bien et le chauffeur, notifie.
     */
    public function complete(Booking $booking): Booking
    {
        if (!in_array($booking->status, ['confirmed', 'in_progress'], true)) {
            throw new InvalidBookingTransitionException('Cette réservation ne peut pas être complétée.');
        }

        DB::transaction(function () use ($booking) {
            $booking->update(['status' => 'completed']);
            $this->releaseBookable($booking);
            $this->releaseDriver($booking);
        });

        $booking->user?->notify(new BookingCompleted($booking));

        return $booking->fresh()->load(['bookable', 'driver']);
    }

    // ===================================================================
    // Effets de bord (privés)
    // ===================================================================

    private function lockBookable(Booking $booking): void
    {
        $bookable = $booking->bookable;

        if ($bookable instanceof Vehicle || $bookable instanceof Property) {
            $bookable->markAsRented();
        }
    }

    private function releaseBookable(Booking $booking): void
    {
        $bookable = $booking->bookable;

        if ($bookable instanceof Vehicle || $bookable instanceof Property) {
            $bookable->markAsAvailable();
        }
    }

    private function lockDriver(Booking $booking): void
    {
        if ($booking->with_driver && $booking->driver) {
            $booking->driver->markAsOnMission();
        }
    }

    private function releaseDriver(Booking $booking): void
    {
        if ($booking->with_driver && $booking->driver) {
            $booking->driver->markAsAvailable();
        }
    }

    /**
     * Crée une Transaction pending si le booking a un montant et n'en a pas déjà.
     * Unifie le comportement entre Api\ et Admin\ (TDA-D01 traité par ce ticket).
     */
    private function ensurePendingTransaction(Booking $booking): void
    {
        if ($booking->total_amount <= 0) {
            return;
        }

        if ($booking->transactions()->exists()) {
            return;
        }

        Transaction::create([
            'booking_id' => $booking->id,
            'user_id' => $booking->user_id,
            'amount' => $booking->total_amount,
            'payment_method' => 'cash',
            'type' => 'full_payment',
            'status' => 'pending',
            'notes' => 'Générée automatiquement à la confirmation de la réservation.',
        ]);
    }
}
