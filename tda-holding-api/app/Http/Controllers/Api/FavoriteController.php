<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Favorite;
use App\Models\Property;
use App\Models\Vehicle;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $favorites = Favorite::where('user_id', $request->user()->id)
            ->with('favorable')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'favorites' => $favorites,
        ]);
    }

    public function toggle(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'favorable_type' => 'required|in:vehicle,property',
            'favorable_id' => 'required|integer',
        ]);

        // TDA-C01 : morph map enregistrée, on résoud via Relation::getMorphedModel.
        $favorableClass = \Illuminate\Database\Eloquent\Relations\Relation::getMorphedModel(
            $validated['favorable_type']
        );
        $favorableClass::findOrFail($validated['favorable_id']);

        $existing = Favorite::where('user_id', $request->user()->id)
            ->where('favorable_type', $validated['favorable_type'])
            ->where('favorable_id', $validated['favorable_id'])
            ->first();

        if ($existing) {
            $existing->delete();
            return response()->json([
                'message' => 'Retiré des favoris.',
                'is_favorite' => false,
            ]);
        }

        Favorite::create([
            'user_id' => $request->user()->id,
            'favorable_type' => $validated['favorable_type'],
            'favorable_id' => $validated['favorable_id'],
        ]);

        return response()->json([
            'message' => 'Ajouté aux favoris.',
            'is_favorite' => true,
        ], 201);
    }
}
