<?php

namespace App\Policies;

use App\Models\Media;
use App\Models\User;

class MediaPolicy
{
    public function before(User $user, string $ability): ?bool
    {
        return $user->isSuperAdmin() ? true : null;
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function delete(User $user, Media $media): bool
    {
        return $user->isAdmin();
    }

    public function setPrimary(User $user, Media $media): bool
    {
        return $user->isAdmin();
    }
}
