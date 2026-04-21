<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Media;
use App\Models\Vehicle;
use App\Support\QueryHelpers;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VehicleController extends Controller
{
    public function index(Request $request)
    {
        $query = Vehicle::withoutTrashed()->with(['category', 'primaryImage', 'owner']);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                QueryHelpers::whereILike($q, 'brand', $search);
                QueryHelpers::orWhereILike($q, 'model', $search);
                QueryHelpers::orWhereILike($q, 'plate_number', $search);
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->input('category_id'));
        }

        $vehicles = $query->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        $categories = Category::ofType('vehicle')->active()->get();

        return Inertia::render('Admin/Vehicles/Index', [
            'vehicles' => $vehicles,
            'categories' => $categories,
            'filters' => $request->only(['search', 'status', 'category_id']),
        ]);
    }

    public function create()
    {
        $categories = Category::ofType('vehicle')->active()->get();

        return Inertia::render('Admin/Vehicles/Form', [
            'categories' => $categories,
            'vehicle' => null,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'brand' => 'required|string|max:255',
            'model' => 'required|string|max:255',
            'year' => 'nullable|integer|min:1990|max:' . (date('Y') + 1),
            'color' => 'nullable|string|max:100',
            'plate_number' => 'nullable|string|unique:vehicles,plate_number',
            'seats' => 'nullable|integer|min:1|max:50',
            'transmission' => 'nullable|in:manual,automatic',
            'fuel_type' => 'nullable|in:essence,diesel,electric,hybrid',
            'mileage' => 'nullable|integer|min:0',
            'daily_rate' => 'nullable|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'offer_type' => 'nullable|in:rent,sale,both',
            'description' => 'nullable|string',
            'location' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
            'has_ac' => 'nullable|boolean',
            'has_gps' => 'nullable|boolean',
            'is_featured' => 'nullable|boolean',
            'images' => 'nullable|array|max:10',
            'images.*' => 'file|mimes:jpeg,png,jpg,webp,heic,heif|max:10240',
        ]);

        $validated['owner_id'] = $request->user()->id;
        unset($validated['images']);

        $vehicle = Vehicle::create($validated);

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $index => $file) {
                $path = $file->store('uploads/vehicles/' . $vehicle->id, 'public');
                Media::create([
                    'mediable_type' => 'vehicle',
                    'mediable_id' => $vehicle->id,
                    'file_path' => $path,
                    'file_name' => $file->getClientOriginalName(),
                    'mime_type' => $file->getMimeType(),
                    'file_size' => $file->getSize(),
                    'is_primary' => $index === 0,
                    'sort_order' => $index,
                ]);
            }
        }

        return redirect()->route('admin.vehicles.index')
            ->with('success', 'Véhicule ajouté avec succès.');
    }

    public function edit($id)
    {
        $vehicle = Vehicle::findOrFail($id);
        $vehicle->load('media');
        $categories = Category::ofType('vehicle')->active()->get();

        return Inertia::render('Admin/Vehicles/Form', [
            'vehicle' => $vehicle,
            'categories' => $categories,
        ]);
    }

    public function update(Request $request, $id)
    {
        $vehicle = Vehicle::findOrFail($id);

        $validated = $request->validate([
            'category_id' => 'sometimes|exists:categories,id',
            'brand' => 'sometimes|string|max:255',
            'model' => 'sometimes|string|max:255',
            'year' => 'nullable|integer|min:1990|max:' . (date('Y') + 1),
            'color' => 'nullable|string|max:100',
            'plate_number' => 'nullable|string|unique:vehicles,plate_number,' . $vehicle->id,
            'seats' => 'nullable|integer|min:1|max:50',
            'transmission' => 'nullable|in:manual,automatic',
            'fuel_type' => 'nullable|in:essence,diesel,electric,hybrid',
            'mileage' => 'nullable|integer|min:0',
            'daily_rate' => 'nullable|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'offer_type' => 'nullable|in:rent,sale,both',
            'status' => 'nullable|in:available,rented,sold,maintenance,unavailable',
            'description' => 'nullable|string',
            'location' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
            'has_ac' => 'nullable|boolean',
            'has_gps' => 'nullable|boolean',
            'is_featured' => 'nullable|boolean',
            'images' => 'nullable|array|max:10',
            'images.*' => 'image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        unset($validated['images']);
        $vehicle->update($validated);

        if ($request->hasFile('images')) {
            $lastOrder = $vehicle->media()->max('sort_order') ?? -1;
            foreach ($request->file('images') as $index => $file) {
                $path = $file->store('uploads/vehicles/' . $vehicle->id, 'public');
                Media::create([
                    'mediable_type' => 'vehicle',
                    'mediable_id' => $vehicle->id,
                    'file_path' => $path,
                    'file_name' => $file->getClientOriginalName(),
                    'mime_type' => $file->getMimeType(),
                    'file_size' => $file->getSize(),
                    'is_primary' => false,
                    'sort_order' => $lastOrder + $index + 1,
                ]);
            }
        }

        return redirect()->route('admin.vehicles.index')
            ->with('success', 'Véhicule mis à jour.');
    }

    public function destroy($id)
    {
        $vehicle = Vehicle::findOrFail($id);

        foreach ($vehicle->media as $media) {
            $path = storage_path('app/public/' . $media->file_path);
            if (file_exists($path)) {
                unlink($path);
            }
            $media->delete();
        }

        $vehicle->delete();

        return redirect()->route('admin.vehicles.index')
            ->with('success', 'Véhicule supprimé.');
    }
}
