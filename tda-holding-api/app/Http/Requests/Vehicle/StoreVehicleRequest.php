<?php

namespace App\Http\Requests\Vehicle;

use App\Models\Vehicle;
use Illuminate\Foundation\Http\FormRequest;

class StoreVehicleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Vehicle::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'category_id' => 'required|exists:categories,id',
            'brand' => 'required|string|max:255',
            'model' => 'required|string|max:255',
            'year' => 'nullable|integer|min:1990|max:' . (date('Y') + 1),
            'color' => 'nullable|string|max:100',
            'plate_number' => 'nullable|string|unique:vehicles,plate_number',
            'seats' => 'integer|min:1|max:50',
            'transmission' => 'in:manual,automatic',
            'fuel_type' => 'in:essence,diesel,electric,hybrid',
            'mileage' => 'nullable|integer|min:0',
            'daily_rate' => 'nullable|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'offer_type' => 'in:rent,sale,both',
            'description' => 'nullable|string',
            'location' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
            'has_ac' => 'boolean',
            'has_gps' => 'boolean',
            'is_featured' => 'boolean',
            'features' => 'nullable|array',
        ];
    }
}
