<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * TDA-D06 : FormRequest qui verrouille explicitement les champs sensibles
 * (role, is_active, password, email_verified_at) sur PUT /api/auth/profile.
 *
 * Seuls les champs listés dans rules() sont acceptés ; tout autre champ
 * envoyé par le client est ignoré par $this->validated().
 */
class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        $userId = $this->user()?->id;

        return [
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'email' => [
                'sometimes',
                'nullable',
                'email',
                Rule::unique('users', 'email')->ignore($userId),
            ],
            'phone' => [
                'sometimes',
                'nullable',
                'string',
                Rule::unique('users', 'phone')->ignore($userId),
            ],
            'address' => 'sometimes|nullable|string',
            'city' => 'sometimes|nullable|string|max:255',
            'country' => 'sometimes|nullable|string|max:255',
        ];
    }
}
