<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Vehicle\StoreVehicleRequest;
use App\Http\Requests\Vehicle\UpdateVehicleRequest;
use App\Models\Vehicle;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VehicleController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Vehicle::with(['category', 'primaryImage', 'media']);

        if ($request->has('category_id')) {
            $query->where('category_id', $request->input('category_id'));
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
        // Note: On affiche tous les véhicules (disponibles ou non)
        // Le client utilise is_available pour afficher un badge "Réservé"

        if ($request->has('city')) {
            $query->where('city', 'like', '%' . $request->input('city') . '%');
        }

        if ($request->has('brand')) {
            $query->where('brand', 'like', '%' . $request->input('brand') . '%');
        }

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('brand', 'like', "%{$search}%")
                  ->orWhere('model', 'like', "%{$search}%")
                  ->orWhere('city', 'like', "%{$search}%")
                  ->orWhere('plate_number', 'like', "%{$search}%");
            });
        }

        if ($request->has('min_price')) {
            $query->where('daily_rate', '>=', $request->input('min_price'));
        }

        if ($request->has('max_price')) {
            $query->where('daily_rate', '<=', $request->input('max_price'));
        }

        if ($request->has('transmission')) {
            $query->where('transmission', $request->input('transmission'));
        }

        if ($request->boolean('featured')) {
            $query->featured();
        }

        $sortBy = $request->input('sort_by', 'created_at');
        $sortDir = $request->input('sort_dir', 'desc');
        $query->orderBy($sortBy, $sortDir);

        $vehicles = $query->paginate($request->input('per_page', 15));

        return response()->json($vehicles);
    }

    public function store(StoreVehicleRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $validated['owner_id'] = $request->user()->id;

        $vehicle = Vehicle::create($validated);

        return response()->json([
            'message' => 'Véhicule ajouté.',
            'data' => $vehicle->load(['category', 'media']),
        ], 201);
    }

    public function show(Vehicle $vehicle): JsonResponse
    {
        // TDA-A03 : ne PAS charger 'owner' — fuite d'infos personnelles
        // (email, phone, address, city) sur route publique.
        $vehicle->load(['category', 'media', 'driver']);

        return response()->json([
            'data' => $vehicle,
        ]);
    }

    public function update(UpdateVehicleRequest $request, Vehicle $vehicle): JsonResponse
    {
        $vehicle->update($request->validated());

        return response()->json([
            'message' => 'Véhicule mis à jour.',
            'data' => $vehicle->fresh()->load(['category', 'media']),
        ]);
    }

    public function destroy(Vehicle $vehicle): JsonResponse
    {
        $this->authorize('delete', $vehicle);

        $vehicle->delete();

        return response()->json([
            'message' => 'Véhicule supprimé.',
        ]);
    }
}
