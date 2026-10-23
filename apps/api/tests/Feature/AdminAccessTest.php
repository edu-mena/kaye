<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminAccessTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config(['kaye.admin_emails' => ['boss@kaye.test', 'mod@kaye.test']]);
    }

    public function test_guests_are_sent_to_the_admin_login(): void
    {
        $this->get('/admin')->assertRedirect('/admin/login');
    }

    public function test_regular_users_cannot_open_the_admin_even_if_allowlisted(): void
    {
        $this->actingAs(User::factory()->create(['email' => 'boss@kaye.test']))
            ->get('/admin')
            ->assertForbidden();
    }

    public function test_admins_outside_the_allowlist_cannot_open_the_admin(): void
    {
        $this->actingAs(User::factory()->admin()->create(['email' => 'intruder@kaye.test']))
            ->get('/admin')
            ->assertForbidden();
    }

    public function test_allowlisted_admins_and_moderators_can_open_the_admin(): void
    {
        $this->actingAs(User::factory()->admin()->create(['email' => 'Boss@Kaye.test']))
            ->get('/admin')
            ->assertOk();

        $moderator = User::factory()->create(['email' => 'mod@kaye.test']);
        $moderator->forceFill(['role' => UserRole::Moderator])->save();

        $this->actingAs($moderator)->get('/admin')->assertOk();
    }

    public function test_empty_allowlist_locks_everyone_out(): void
    {
        config(['kaye.admin_emails' => []]);

        $this->actingAs(User::factory()->admin()->create(['email' => 'boss@kaye.test']))
            ->get('/admin')
            ->assertForbidden();
    }

    public function test_minor_is_detected_from_birth_year(): void
    {
        $this->assertTrue(User::factory()->minor()->make()->isMinor());
        $this->assertFalse(User::factory()->make()->isMinor());
    }
}
