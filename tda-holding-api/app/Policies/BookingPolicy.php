<?php

namespace App\Policies;

use App\Models\Booking;
use App\Models\User;

class BookingPolicy
{
    public function before(User $user, string $ability): ?bool
    {
        return $user->isSuperAdmin() ? true : null;
    }

    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Booking $booking): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $user->id === $booking->user_id;
    }

    public function create(User $user): bool
    {
        return $user->isClient() || $user->isAdmin();
    }

    public function cancel(User $user, Booking $booking): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $user->id === $booking->user_id;
    }

    public function confirm(User $user, Booking $booking): bool
    {
        return $user->isAdmin();
    }

    public function reject(User $user, Booking $booking): bool
    {
        return $user->isAdmin();
    }

    public function start(User $user, Booking $booking): bool
    {
        return $user->isAdmin();
    }

    public function complete(User $user, Booking $booking): bool
    {
        return $user->isAdmin();
    }
}
