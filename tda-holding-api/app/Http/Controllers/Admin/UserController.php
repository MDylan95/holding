<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function toggleStatus(Request $request, User $user): \Illuminate\Http\RedirectResponse
    {
        // TDA-A01 : déléguer à UserPolicy (super_admin only, jamais sur un autre admin).
        if (! $request->user()->can('toggleStatus', $user)) {
            return back()->with('error', 'Impossible de modifier le statut de cet utilisateur.');
        }

        $user->update(['is_active' => !$user->is_active]);

        return back()->with('success', $user->is_active ? 'Client activé.' : 'Client désactivé.');
    }
}
