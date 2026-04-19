<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Property\StorePropertyRequest;
use App\Http\Requests\Property\UpdatePropertyRequest;
use App\Models\Property;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PropertyController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Property::with(['category', 'primaryImage', 'media']);

        if ($request->has('category_id')) {
            $query->where('category_id', $request->input('category_id'));
        }

        if ($request->has('property_type')) {
            $query->where('property_type', $request->input('property_type'));
        }

        if ($request->has('offer_type')) {
            $offerType = $request->input('offer_type');
            if ($offerType === 'rent') {
                $query->forRent();
            } elseif ($offerType === 'sale') {
                $query->forSale();
            }
        }

        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }
        // Note: On affiche toutes les propriétés (disponibles ou non)
        // Le client utilise is_available pour afficher un badge "Réservé"

        if ($request->has('city')) {
            $query->where('city', 'like', '%' . $request->input('city') . '%');
        }

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('city', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%");
            });
        }

        if ($request->has('min_price')) {
            $min = $request->input('min_price');
            $query->where(function ($q) use ($min) {
                $q->where('sale_price', '>=', $min)
                  ->orWhere('monthly_rent', '>=', $min);
            });
        }

        if ($request->has('max_price')) {
            $max = $request->input('max_price');
            $query->where(function ($q) use ($max) {
                $q->where(function ($q2) use ($max) {
                    $q2->whereNotNull('sale_price')->where('sale_price', '<=', $max);
                })->orWhere(function ($q2) use ($max) {
                    $q2->whereNotNull('monthly_rent')->where('monthly_rent', '<=', $max);
                });
            });
        }

        if ($request->has('min_rooms')) {
            $query->where('rooms', '>=', $request->input('min_rooms'));
        }

        if ($request->has('min_bedrooms')) {
            $query->where('bedrooms', '>=', $request->input('min_bedrooms'));
        }

        if ($request->boolean('featured')) {
            $query->featured();
        }

        $sortBy = $request->input('sort_by', 'created_at');
        $sortDir = $request->input('sort_dir', 'desc');
        $query->orderBy($sortBy, $sortDir);

        $properties = $query->paginate($request->input('per_page', 15));

        return response()->json($properties);
    }

    public function store(StorePropertyRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $validated['owner_id'] = $request->user()->id;

        $property = Property::create($validated);

        return response()->json([
            'message' => 'Bien immobilier ajouté.',
            'data' => $property->load(['category', 'media']),
        ], 201);
    }

    public function show(Property $property): JsonResponse
    {
        // TDA-A03 : ne PAS charger 'owner' — fuite d'infos personnelles
        // (email, phone, address, city) sur route publique.
        $property->load(['category', 'media']);

        return response()->json([
            'data' => $property,
        ]);
    }

    public function update(UpdatePropertyRequest $request, Property $property): JsonResponse
    {
        $property->update($request->validated());

        return response()->json([
            'message' => 'Bien immobilier mis à jour.',
            'data' => $property->fresh()->load(['category', 'media']),
        ]);
    }

    public function destroy(Property $property): JsonResponse
    {
        $this->authorize('delete', $property);

        $property->delete();

        return response()->json([
            'message' => 'Bien immobilier supprimé.',
        ]);
    }
}
