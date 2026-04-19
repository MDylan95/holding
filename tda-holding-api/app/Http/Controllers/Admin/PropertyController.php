<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Media;
use App\Models\Property;
use App\Support\QueryHelpers;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PropertyController extends Controller
{
    public function index(Request $request)
    {
        $query = Property::with(['category', 'primaryImage', 'owner']);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                QueryHelpers::whereILike($q, 'title', $search);
                QueryHelpers::orWhereILike($q, 'location', $search);
                QueryHelpers::orWhereILike($q, 'city', $search);
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('property_type')) {
            $query->where('property_type', $request->input('property_type'));
        }

        $properties = $query->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        $categories = Category::ofType('property')->active()->get();

        return Inertia::render('Admin/Properties/Index', [
            'properties' => $properties,
            'categories' => $categories,
            'filters' => $request->only(['search', 'status', 'property_type']),
        ]);
    }

    public function create()
    {
        $categories = Category::ofType('property')->active()->get();

        return Inertia::render('Admin/Properties/Form', [
            'categories' => $categories,
            'property' => null,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'property_type' => 'required|in:villa,apartment,land,house,duplex,studio',
            'offer_type' => 'nullable|in:rent,sale,both',
            'sale_price' => 'nullable|numeric|min:0',
            'monthly_rent' => 'nullable|numeric|min:0',
            'surface_area' => 'nullable|numeric|min:0',
            'rooms' => 'nullable|integer|min:0',
            'bedrooms' => 'nullable|integer|min:0',
            'bathrooms' => 'nullable|integer|min:0',
            'floors' => 'nullable|integer|min:0',
            'has_pool' => 'nullable|boolean',
            'has_garage' => 'nullable|boolean',
            'has_garden' => 'nullable|boolean',
            'is_furnished' => 'nullable|boolean',
            'location' => 'required|string|max:255',
            'city' => 'nullable|string|max:255',
            'country' => 'nullable|string|max:255',
            'is_featured' => 'nullable|boolean',
            'images' => 'nullable|array|max:10',
            'images.*' => 'image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        $validated['owner_id'] = $request->user()->id;
        unset($validated['images']);

        $property = Property::create($validated);

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $index => $file) {
                $path = $file->store('uploads/properties/' . $property->id, 'public');
                Media::create([
                    'mediable_type' => 'property',
                    'mediable_id' => $property->id,
                    'file_path' => $path,
                    'file_name' => $file->getClientOriginalName(),
                    'mime_type' => $file->getMimeType(),
                    'file_size' => $file->getSize(),
                    'is_primary' => $index === 0,
                    'sort_order' => $index,
                ]);
            }
        }

        return redirect()->route('admin.properties.index')
            ->with('success', 'Bien immobilier ajouté.');
    }

    public function edit(Property $property)
    {
        $property->load('media');
        $categories = Category::ofType('property')->active()->get();

        return Inertia::render('Admin/Properties/Form', [
            'property' => $property,
            'categories' => $categories,
        ]);
    }

    public function update(Request $request, Property $property)
    {
        $validated = $request->validate([
            'category_id' => 'sometimes|exists:categories,id',
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'property_type' => 'sometimes|in:villa,apartment,land,house,duplex,studio',
            'offer_type' => 'nullable|in:rent,sale,both',
            'sale_price' => 'nullable|numeric|min:0',
            'monthly_rent' => 'nullable|numeric|min:0',
            'surface_area' => 'nullable|numeric|min:0',
            'rooms' => 'nullable|integer|min:0',
            'bedrooms' => 'nullable|integer|min:0',
            'bathrooms' => 'nullable|integer|min:0',
            'floors' => 'nullable|integer|min:0',
            'has_pool' => 'nullable|boolean',
            'has_garage' => 'nullable|boolean',
            'has_garden' => 'nullable|boolean',
            'is_furnished' => 'nullable|boolean',
            'location' => 'sometimes|string|max:255',
            'city' => 'nullable|string|max:255',
            'country' => 'nullable|string|max:255',
            'status' => 'nullable|in:available,rented,sold,unavailable,maintenance',
            'is_featured' => 'nullable|boolean',
            'images' => 'nullable|array|max:10',
            'images.*' => 'image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        unset($validated['images']);
        $property->update($validated);

        if ($request->hasFile('images')) {
            $lastOrder = $property->media()->max('sort_order') ?? -1;
            foreach ($request->file('images') as $index => $file) {
                $path = $file->store('uploads/properties/' . $property->id, 'public');
                Media::create([
                    'mediable_type' => 'property',
                    'mediable_id' => $property->id,
                    'file_path' => $path,
                    'file_name' => $file->getClientOriginalName(),
                    'mime_type' => $file->getMimeType(),
                    'file_size' => $file->getSize(),
                    'is_primary' => false,
                    'sort_order' => $lastOrder + $index + 1,
                ]);
            }
        }

        return redirect()->route('admin.properties.index')
            ->with('success', 'Bien immobilier mis à jour.');
    }

    public function destroy(Property $property)
    {
        foreach ($property->media as $media) {
            $path = storage_path('app/public/' . $media->file_path);
            if (file_exists($path)) {
                unlink($path);
            }
            $media->delete();
        }

        $property->delete();

        return redirect()->route('admin.properties.index')
            ->with('success', 'Bien immobilier supprimé.');
    }
}
