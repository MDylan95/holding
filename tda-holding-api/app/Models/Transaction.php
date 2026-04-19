<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

/**
 * Statuts valides : pending | confirmed | completed.
 *
 * TDA-E01 : "refunded" et "failed" ont été retirés tant que les flux
 * remboursement et échec de paiement ne sont pas implémentés.
 * Ils seront réintroduits en Phase 6 (mobile money).
 */
class Transaction extends Model
{
    use SoftDeletes;

    public const STATUSES = ['pending', 'confirmed', 'completed'];

    protected $fillable = [
        'reference',
        'booking_id',
        'user_id',
        'amount',
        'payment_method',
        'status',
        'type',
        'confirmed_by',
        'confirmed_at',
        'notes',
        'commission_rate',
        'commission_amount',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'commission_rate' => 'decimal:2',
            'commission_amount' => 'decimal:2',
            'confirmed_at' => 'datetime',
        ];
    }

    // --- Boot ---

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($transaction) {
            if (empty($transaction->reference)) {
                $transaction->reference = 'TXN-' . strtoupper(Str::random(8));
            }
        });
    }

    // --- Relations ---

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function confirmedBy()
    {
        return $this->belongsTo(User::class, 'confirmed_by');
    }

    // --- Scopes ---

    /**
     * TDA-A01 : scoping de requête — un non-admin ne voit que ses ressources.
     */
    public function scopeVisibleTo($query, User $user)
    {
        if ($user->isAdmin()) {
            return $query;
        }

        return $query->where('user_id', $user->id);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    // --- Helpers ---

    public function confirm(int $adminId): void
    {
        $this->update([
            'status' => 'confirmed',
            'confirmed_by' => $adminId,
            'confirmed_at' => now(),
        ]);
    }

    public function markAsCompleted(): void
    {
        $this->update(['status' => 'completed']);
    }
}
