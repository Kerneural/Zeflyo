<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class SettingsTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_get_user_profile(): void
    {
        $user = User::factory()->create([
            'display_name' => 'John Doe Display',
            'timezone' => 'Asia/Ho_Chi_Minh',
        ]);

        $response = $this->actingAs($user)
            ->getJson('/api/user/profile');

        $response->assertStatus(200)
            ->assertJson([
                'id' => $user->id,
                'name' => $user->name,
                'display_name' => 'John Doe Display',
                'email' => $user->email,
                'avatar_url' => null,
                'timezone' => 'Asia/Ho_Chi_Minh',
            ]);
    }

    public function test_can_update_user_profile(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->putJson('/api/user/profile', [
                'display_name' => 'Updated Name',
                'timezone' => 'Europe/London',
                'avatar_url' => 'https://example.com/avatar.png'
            ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'display_name' => 'Updated Name',
            'timezone' => 'Europe/London',
            'avatar_url' => 'https://example.com/avatar.png'
        ]);
    }

    public function test_can_update_user_password(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('old_password123'),
        ]);

        // Wrong current password
        $response = $this->actingAs($user)
            ->putJson('/api/user/password', [
                'current_password' => 'wrong_password',
                'password' => 'new_password123',
                'password_confirmation' => 'new_password123',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['current_password']);

        // Correct current password
        $response = $this->actingAs($user)
            ->putJson('/api/user/password', [
                'current_password' => 'old_password123',
                'password' => 'new_password123',
                'password_confirmation' => 'new_password123',
            ]);

        $response->assertStatus(200);
        $this->assertTrue(Hash::check('new_password123', $user->fresh()->password));
    }

    public function test_can_upload_file(): void
    {
        Storage::fake('public');

        $user = User::factory()->create();
        $file = UploadedFile::fake()->image('avatar.jpg');

        $response = $this->actingAs($user)
            ->postJson('/api/upload', [
                'file' => $file
            ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['url', 'message']);

        $url = $response->json('url');
        $path = str_replace(asset('storage/'), '', $url);
        Storage::disk('public')->assertExists($path);
    }

    public function test_can_get_plans(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->getJson('/api/plans');

        $response->assertStatus(200)
            ->assertJsonCount(3);
    }

    public function test_can_get_subscription(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->getJson('/api/user/subscription');

        $response->assertStatus(200)
            ->assertJson([
                'plan' => 'free',
                'expires_at' => null
            ]);
    }
}
