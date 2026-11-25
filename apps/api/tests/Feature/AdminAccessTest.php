<?php

namespace Tests\Feature;

use App\Enums\StaffRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/**
 * The panel's locks (docs/seguranca.md): a staff role, the email in ADMIN_EMAILS, and the second factor (TOTP).
 */
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

    public function test_every_allowlisted_staff_role_can_open_the_admin(): void
    {
        $this->actingAs(User::factory()->admin()->create(['email' => 'Boss@Kaye.test']))->get('/admin')->assertOk();
        $this->actingAs(User::factory()->reviewer()->create(['email' => 'mod@kaye.test']))->get('/admin')->assertOk();
    }

    public function test_empty_allowlist_locks_everyone_out(): void
    {
        config(['kaye.admin_emails' => []]);

        $this->actingAs(User::factory()->admin()->create(['email' => 'boss@kaye.test']))
            ->get('/admin')
            ->assertForbidden();
    }

    public function test_the_panel_requires_the_second_factor_before_anything_else(): void
    {
        $admin = User::factory()->admin()->withoutTotp()->create(['email' => 'boss@kaye.test']);

        $this->actingAs($admin)->get('/admin')->assertRedirectContains('/admin/multi-factor-authentication/set-up');
        $this->actingAs($admin)->get('/admin/waitlist-entries')->assertRedirectContains('/admin/multi-factor-authentication/set-up');
    }

    public function test_the_totp_secret_is_encrypted_and_never_serialised(): void
    {
        $admin = User::factory()->admin()->create(['email' => 'boss@kaye.test']);

        $stored = DB::table('users')->where('id', $admin->id)->value('app_authentication_secret');
        $this->assertIsString($stored);
        $this->assertStringNotContainsString('JBSWY3DPEHPK3PXP', $stored);
        $this->assertArrayNotHasKey('app_authentication_secret', $admin->toArray());
    }

    public function test_the_old_roles_moved_to_the_staff_roles(): void
    {
        $this->assertSame(['admin', 'editor', 'reviewer'], StaffRole::values());
        $this->assertFalse(\Illuminate\Support\Facades\Schema::hasColumn('users', 'role'));
        $this->assertSame(3, DB::table('roles')->count());
    }

    public function test_minor_is_detected_from_birth_year(): void
    {
        $this->assertTrue(User::factory()->minor()->make()->isMinor());
        $this->assertFalse(User::factory()->make()->isMinor());
    }
}
