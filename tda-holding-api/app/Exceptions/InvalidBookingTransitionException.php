<?php

namespace App\Exceptions;

use DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Erreur de transition d'état sur une réservation.
 *
 * Rendu par défaut en 422 JSON (route API) ou via back()->with('error', ...) (web Inertia).
 */
final class InvalidBookingTransitionException extends DomainException
{
    public function render(Request $request): JsonResponse|false
    {
        if ($request->expectsJson()) {
            return response()->json([
                'message' => $this->getMessage(),
            ], 422);
        }

        return false; // laisse Laravel retomber sur le rendu par défaut
    }
}
