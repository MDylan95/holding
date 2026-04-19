<?php

namespace App\Http\Requests\Property;

use App\Models\Property;
use Illuminate\Foundation\Http\FormRequest;

class UpdatePropertyRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Property|null $property */
        $property = $this->route('property');

        return $property !== null && ($this->user()?->can('update', $property) ?? false);
    }

    public function rules(): array
    {
        return [
            'category_id' => 'sometimes|exists:categories,id',
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'property_type' => 'sometimes|in:villa,apartment,land,house,duplex,studio',
            'offer_type' => 'in:rent,sale,both',
            'sale_price' => 'nullable|numeric|min:0',
            'monthly_rent' => 'nullable|numeric|min:0',
            'surface_area' => 'nullable|numeric|min:0',
            'rooms' => 'nullable|integer|min:0',
            'bedrooms' => 'nullable|integer|min:0',
            'bathrooms' => 'nullable|integer|min:0',
            'floors' => 'nullable|integer|min:0',
            'has_pool' => 'boolean',
            'has_garage' => 'boolean',
            'has_garden' => 'boolean',
            'is_furnished' => 'boolean',
            'location' => 'sometimes|string|max:255',
            'city' => 'nullable|string|max:255',
            'country' => 'nullable|string|max:255',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'status' => 'in:available,rented,sold,unavailable,maintenance',
            'is_featured' => 'boolean',
            'features' => 'nullable|array',
        ];
    }
}
