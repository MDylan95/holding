<?php

namespace App\Policies;

use App\Models\Transaction;
use App\Models\User;

class TransactionPolicy
{
    public function before(User $user, string $ability): ?bool
    {
        return $user->isSuperAdmin() ? true : null;
    }

    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Transaction $transaction): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $user->id === $transaction->user_id;
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function confirm(User $user, Transaction $transaction): bool
    {
        return $user->isAdmin();
    }

    public function complete(User $user, Transaction $transaction): bool
    {
        return $user->isAdmin();
    }

    // Seul super_admin peut supprimer (cf. TDA-A02 + Winston before())
    public function delete(User $user, Transaction $transaction): bool
    {
        return false;
    }
}
