<?php

namespace App\Http\Requests\Driver;

use App\Models\Driver;
use Illuminate\Foundation\Http\FormRequest;

class UpdateDriverRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Driver|null $driver */
        $driver = $this->route('driver');

        return $driver !== null && ($this->user()?->can('update', $driver) ?? false);
    }

    public function rules(): array
    {
        /** @var Driver $driver */
        $driver = $this->route('driver');

        return [
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|unique:drivers,phone,' . $driver->id,
            'email' => 'nullable|email',
            'license_number' => 'sometimes|string|unique:drivers,license_number,' . $driver->id,
            'license_expiry' => 'nullable|date',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:255',
            'experience_years' => 'integer|min:0',
            'daily_rate' => 'numeric|min:0',
            'status' => 'in:available,on_mission,off_duty,unavailable',
            'assigned_vehicle_id' => 'nullable|exists:vehicles,id',
            'notes' => 'nullable|string',
            'is_active' => 'boolean',
        ];
    }
}
