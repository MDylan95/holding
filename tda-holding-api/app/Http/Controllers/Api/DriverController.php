<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Driver\StoreDriverRequest;
use App\Http\Requests\Driver\UpdateDriverRequest;
use App\Models\Driver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DriverController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Driver::with('assignedVehicle');

        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->boolean('available_only')) {
            $query->available();
        }

        if ($request->has('city')) {
            $query->where('city', 'like', '%' . $request->input('city') . '%');
        }

        $drivers = $query->active()->orderBy('first_name')->paginate($request->input('per_page', 15));

        return response()->json($drivers);
    }

    public function store(StoreDriverRequest $request): JsonResponse
    {
        $driver = Driver::create($request->validated());

        return response()->json([
            'message' => 'Chauffeur ajouté.',
            'driver' => $driver->load('assignedVehicle'),
        ], 201);
    }

    public function show(Driver $driver): JsonResponse
    {
        $driver->load(['assignedVehicle', 'bookings']);

        return response()->json([
            'driver' => $driver,
        ]);
    }

    public function update(UpdateDriverRequest $request, Driver $driver): JsonResponse
    {
        $driver->update($request->validated());

        return response()->json([
            'message' => 'Chauffeur mis à jour.',
            'driver' => $driver->fresh()->load('assignedVehicle'),
        ]);
    }

    public function destroy(Driver $driver): JsonResponse
    {
        $this->authorize('delete', $driver);

        $driver->delete();

        return response()->json([
            'message' => 'Chauffeur supprimé.',
        ]);
    }

    public function available(): JsonResponse
    {
        $drivers = Driver::available()->with('assignedVehicle')->get();

        return response()->json([
            'drivers' => $drivers,
        ]);
    }
}
