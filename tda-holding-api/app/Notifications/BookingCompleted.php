<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class BookingCompleted extends Notification
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
            'title'      => 'Réservation terminée',
            'body'       => "Votre réservation {$this->booking->reference} est terminée. Merci de votre confiance.",
            'type'       => 'booking_completed',
            'booking_id' => $this->booking->id,
            'reference'  => $this->booking->reference,
        ];
    }
}
