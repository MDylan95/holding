<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class BookingCancelled extends Notification
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
            'title'      => 'Réservation annulée',
            'body'       => "La réservation {$this->booking->reference} a été annulée.",
            'type'       => 'booking_cancelled',
            'booking_id' => $this->booking->id,
            'reference'  => $this->booking->reference,
        ];
    }
}
