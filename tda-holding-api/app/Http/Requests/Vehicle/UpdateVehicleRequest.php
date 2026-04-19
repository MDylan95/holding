<?php

namespace App\Http\Requests\Vehicle;

use App\Models\Vehicle;
use Illuminate\Foundation\Http\FormRequest;

class UpdateVehicleRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Vehicle|null $vehicle */
        $vehicle = $this->route('vehicle');

        return $vehicle !== null && ($this->user()?->can('update', $vehicle) ?? false);
    }

    public function rules(): array
    {
        /** @var Vehicle $vehicle */
        $vehicle = $this->route('vehicle');

        return [
            'category_id' => 'sometimes|exists:categories,id',
            'brand' => 'sometimes|string|max:255',
            'model' => 'sometimes|string|max:255',
            'year' => 'nullable|integer|min:1990|max:' . (date('Y') + 1),
            'color' => 'nullable|string|max:100',
            'plate_number' => 'nullable|string|unique:vehicles,plate_number,' . $vehicle->id,
            'seats' => 'integer|min:1|max:50',
            'transmission' => 'in:manual,automatic',
            'fuel_type' => 'in:essence,diesel,electric,hybrid',
            'mileage' => 'nullable|integer|min:0',
            'daily_rate' => 'nullable|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'offer_type' => 'in:rent,sale,both',
            'status' => 'in:available,rented,sold,maintenance,unavailable',
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
