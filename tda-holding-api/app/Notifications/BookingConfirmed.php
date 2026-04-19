<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class BookingConfirmed extends Notification
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
            'title'      => 'Réservation confirmée',
            'body'       => "Votre réservation {$this->booking->reference} a été confirmée.",
            'type'       => 'booking_confirmed',
            'booking_id' => $this->booking->id,
            'reference'  => $this->booking->reference,
        ];
    }
}
