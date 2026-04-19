<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class BookingRejected extends Notification
{
    use Queueable;

    public function __construct(public Booking $booking) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toDatabase($notifiable): array
    {
        return [
            'title'            => 'Réservation rejetée',
            'body'             => "La réservation {$this->booking->reference} a été rejetée. Raison : {$this->booking->rejection_reason}",
            'type'             => 'booking_rejected',
            'booking_id'       => $this->booking->id,
            'reference'        => $this->booking->reference,
            'rejection_reason' => $this->booking->rejection_reason,
        ];
    }
}
