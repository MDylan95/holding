<?php

namespace App\Policies;

use App\Models\Property;
use App\Models\User;

class PropertyPolicy
{
    public function before(User $user, string $ability): ?bool
    {
        return $user->isSuperAdmin() ? true : null;
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, Property $property): bool
    {
        return $user->isAdmin();
    }

    // Seul super_admin peut supprimer (TDA-A02)
    public function delete(User $user, Property $property): bool
    {
        return false;
    }
}
