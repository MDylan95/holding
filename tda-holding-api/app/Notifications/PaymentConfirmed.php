<?php

namespace App\Notifications;

use App\Models\Transaction;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class PaymentConfirmed extends Notification
{
    use Queueable;

    public function __construct(public Transaction $transaction) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toDatabase($notifiable): array
    {
        return [
            'title'          => 'Paiement confirmé',
            'body'           => "Votre paiement de " . number_format($this->transaction->amount, 0, ',', ' ') . " F CFA a été confirmé.",
            'type'           => 'payment_confirmed',
            'transaction_id' => $this->transaction->id,
            'reference'      => $this->transaction->reference,
            'amount'         => $this->transaction->amount,
        ];
    }
}
