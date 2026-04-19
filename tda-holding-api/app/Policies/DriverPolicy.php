<?php

namespace App\Policies;

use App\Models\Driver;
use App\Models\User;

class DriverPolicy
{
    public function before(User $user, string $ability): ?bool
    {
        return $user->isSuperAdmin() ? true : null;
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, Driver $driver): bool
    {
        return $user->isAdmin();
    }

    // Seul super_admin peut supprimer (TDA-A02)
    public function delete(User $user, Driver $driver): bool
    {
        return false;
    }
}
