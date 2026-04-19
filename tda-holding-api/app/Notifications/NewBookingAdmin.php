<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class NewBookingAdmin extends Notification
{
    use Queueable;

    public function __construct(public Booking $booking) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toDatabase($notifiable): array
    {
        $client = $this->booking->user;
        $name = $client ? "{$client->first_name} {$client->last_name}" : 'Un client';

        return [
            'title'      => 'Nouvelle réservation',
            'body'       => "{$name} a effectué la réservation {$this->booking->reference}.",
            'type'       => 'new_booking',
            'booking_id' => $this->booking->id,
            'reference'  => $this->booking->reference,
        ];
    }
}
