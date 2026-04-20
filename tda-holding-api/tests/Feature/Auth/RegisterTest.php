<?php

namespace Tests\Feature\Auth;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * TDA-Q02 — règles de mot de passe (Password::defaults = min 8).
 */
class RegisterTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_rejects_short_password(): void
    {
        $this->postJson('/api/v1/auth/register', [
            'first_name' => 'Test',
            'last_name' => 'User',
            'email' => 'test@example.com',
            'password' => 'abc123',
            'password_confirmation' => 'abc123',
        ])->assertStatus(422)
          ->assertJsonValidationErrors('password');
    }

    public function test_register_accepts_8_char_password(): void
    {
        $this->postJson('/api/v1/auth/register', [
            'first_name' => 'Test',
            'last_name' => 'User',
            'email' => 'test@example.com',
            'password' => 'Abcdef12',
            'password_confirmation' => 'Abcdef12',
        ])->assertStatus(201);
    }
}
