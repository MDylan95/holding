<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/**
 * TDA-D06 : UpdateProfileRequest refuse toute tentative de mass assignment
 * sur les champs sensibles (role, is_active, password, email_verified_at).
 */
class ProfileUpdateSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_role_cannot_be_escalated_via_profile_update(): void
    {
        $client = User::factory()->create(['role' => 'client']);
        Sanctum::actingAs($client);

        $this->putJson('/api/v1/auth/profile', [
            'first_name' => 'Hacker',
            'role' => 'super_admin',
            'is_active' => false,
        ])->assertStatus(200);

        $client->refresh();

        $this->assertSame('client', $client->role);
        $this->assertTrue($client->is_active);
        $this->assertSame('Hacker', $client->first_name);
    }

    public function test_password_cannot_be_changed_via_profile_update(): void
    {
        $client = User::factory()->create();
        $originalPassword = $client->password;

        Sanctum::actingAs($client);

        $this->putJson('/api/v1/auth/profile', [
            'password' => 'new-password',
        ])->assertStatus(200);

        $this->assertSame($originalPassword, $client->fresh()->password);
    }

    public function test_legitimate_fields_are_updated(): void
    {
        $client = User::factory()->create();
        Sanctum::actingAs($client);

        $this->putJson('/api/v1/auth/profile', [
            'first_name' => 'Nouveau',
            'last_name' => 'Nom',
            'city' => 'Abidjan',
        ])->assertStatus(200);

        $fresh = $client->fresh();
        $this->assertSame('Nouveau', $fresh->first_name);
        $this->assertSame('Nom', $fresh->last_name);
        $this->assertSame('Abidjan', $fresh->city);
    }
}
