<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Driver;
use App\Models\Vehicle;
use App\Support\QueryHelpers;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DriverController extends Controller
{
    public function index(Request $request)
    {
        $query = Driver::with('assignedVehicle');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                QueryHelpers::whereILike($q, 'first_name', $search);
                QueryHelpers::orWhereILike($q, 'last_name', $search);
                QueryHelpers::orWhereILike($q, 'phone', $search);
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $drivers = $query->active()
            ->orderBy('first_name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Drivers/Index', [
            'drivers' => $drivers,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function create()
    {
        $vehicles = Vehicle::available()->get(['id', 'brand', 'model', 'plate_number']);

        return Inertia::render('Admin/Drivers/Form', [
            'driver' => null,
            'vehicles' => $vehicles,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'phone' => 'required|string|unique:drivers,phone',
            'email' => 'nullable|email',
            'license_number' => 'required|string|unique:drivers,license_number',
            'license_expiry' => 'nullable|date',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:255',
            'experience_years' => 'nullable|integer|min:0',
            'daily_rate' => 'nullable|numeric|min:0',
            'assigned_vehicle_id' => 'nullable|exists:vehicles,id',
            'notes' => 'nullable|string',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        if ($request->hasFile('avatar')) {
            $validated['avatar'] = $request->file('avatar')->store('drivers/avatars', 'public');
        }

        Driver::create($validated);

        return redirect()->route('admin.drivers.index')
            ->with('success', 'Chauffeur ajouté.');
    }

    public function edit(Driver $driver)
    {
        $vehicles = Vehicle::where(function ($q) use ($driver) {
            $q->available()
              ->orWhere('id', $driver->assigned_vehicle_id);
        })->get(['id', 'brand', 'model', 'plate_number']);

        return Inertia::render('Admin/Drivers/Form', [
            'driver' => $driver,
            'vehicles' => $vehicles,
        ]);
    }

    public function update(Request $request, Driver $driver)
    {
        $validated = $request->validate([
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|unique:drivers,phone,' . $driver->id,
            'email' => 'nullable|email',
            'license_number' => 'sometimes|string|unique:drivers,license_number,' . $driver->id,
            'license_expiry' => 'nullable|date',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:255',
            'experience_years' => 'nullable|integer|min:0',
            'daily_rate' => 'nullable|numeric|min:0',
            'status' => 'nullable|in:available,on_mission,off_duty,unavailable',
            'assigned_vehicle_id' => 'nullable|exists:vehicles,id',
            'notes' => 'nullable|string',
            'is_active' => 'nullable|boolean',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        if ($request->hasFile('avatar')) {
            if ($driver->avatar) {
                \Storage::disk('public')->delete($driver->avatar);
            }
            $validated['avatar'] = $request->file('avatar')->store('drivers/avatars', 'public');
        }

        $driver->update($validated);

        return redirect()->route('admin.drivers.index')
            ->with('success', 'Chauffeur mis à jour.');
    }

    public function destroy(Driver $driver)
    {
        $driver->delete();

        return redirect()->route('admin.drivers.index')
            ->with('success', 'Chauffeur supprimé.');
    }
}
