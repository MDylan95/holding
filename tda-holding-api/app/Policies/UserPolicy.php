<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    // Pas de before() ici : super_admin ne doit PAS pouvoir modifier un autre admin.
    // La règle est encapsulée explicitement dans toggleStatus().

    public function toggleStatus(User $actor, User $target): bool
    {
        // Seul le super_admin peut gérer les comptes.
        if (!$actor->isSuperAdmin()) {
            return false;
        }

        // Ne jamais agir sur un autre administrateur (super_admin ou agent).
        if ($target->isAdmin()) {
            return false;
        }

        // Ne pas se désactiver soi-même par mégarde.
        return $actor->id !== $target->id;
    }
}
