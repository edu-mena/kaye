<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_sent_to_the_admin_login(): void
    {
        $this->get('/admin')->assertRedirect('/admin/login');
    }

    public function test_regular_users_cannot_open_the_admin(): void
    {
        $this->actingAs(User::factory()->create())
            ->get('/admin')
            ->assertForbidden();
    }

    public function test_moderators_and_admins_can_open_the_admin(): void
    {
        $this->actingAs(User::factory()->admin()->create())->get('/admin')->assertOk();

        $moderator = User::factory()->create();
        $moderator->forceFill(['role' => UserRole::Moderator])->save();

        $this->actingAs($moderator)->get('/admin')->assertOk();
    }

    public function test_minor_is_detected_from_birth_year(): void
    {
        $this->assertTrue(User::factory()->minor()->make()->isMinor());
        $this->assertFalse(User::factory()->make()->isMinor());
    }
}
