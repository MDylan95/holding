<?php

namespace App\Http\Requests\Driver;

use App\Models\Driver;
use Illuminate\Foundation\Http\FormRequest;

class StoreDriverRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Driver::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'phone' => 'required|string|unique:drivers,phone',
            'email' => 'nullable|email',
            'license_number' => 'required|string|unique:drivers,license_number',
            'license_expiry' => 'nullable|date',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:255',
            'experience_years' => 'integer|min:0',
            'daily_rate' => 'numeric|min:0',
            'assigned_vehicle_id' => 'nullable|exists:vehicles,id',
            'notes' => 'nullable|string',
        ];
    }
}
