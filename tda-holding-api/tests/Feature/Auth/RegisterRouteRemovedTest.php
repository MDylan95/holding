<?php

namespace Tests\Feature\Auth;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegisterRouteRemovedTest extends TestCase
{
    use RefreshDatabase;

    public function test_get_register_route_returns_404(): void
    {
        $this->get('/register')->assertStatus(404);
    }

    public function test_post_register_route_returns_404(): void
    {
        $this->post('/register', [
            'first_name' => 'Test',
            'last_name' => 'User',
            'email' => 'test@example.com',
            'password' => 'Abcdef12',
            'password_confirmation' => 'Abcdef12',
        ])->assertStatus(404);
    }

    public function test_api_register_route_still_works(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'first_name' => 'Test',
            'last_name' => 'User',
            'email' => 'test@example.com',
            'password' => 'Abcdef12',
            'password_confirmation' => 'Abcdef12',
        ]);

        $response->assertStatus(201);
    }
}
