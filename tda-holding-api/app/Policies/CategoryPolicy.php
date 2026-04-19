<?php

namespace App\Policies;

use App\Models\Category;
use App\Models\User;

/**
 * TDA-A02 : CRUD catégories réservé au super_admin uniquement.
 */
class CategoryPolicy
{
    public function create(User $user): bool
    {
        return $user->isSuperAdmin();
    }

    public function update(User $user, Category $category): bool
    {
        return $user->isSuperAdmin();
    }

    public function delete(User $user, Category $category): bool
    {
        return $user->isSuperAdmin();
    }
}
