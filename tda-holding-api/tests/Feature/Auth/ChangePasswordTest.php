<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/**
 * TDA-Q02 — règles de mot de passe sur changePassword (min 8).
 */
class ChangePasswordTest extends TestCase
{
    use RefreshDatabase;

    public function test_change_password_rejects_short_password(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->putJson('/api/auth/password', [
            'current_password' => 'password',
            'password' => 'abc123',
            'password_confirmation' => 'abc123',
        ])->assertStatus(422)
          ->assertJsonValidationErrors('password');
    }

    public function test_change_password_accepts_valid_password(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->putJson('/api/auth/password', [
            'current_password' => 'password',
            'password' => 'Abcdef12',
            'password_confirmation' => 'Abcdef12',
        ])->assertStatus(200);
    }
}
