<?php

namespace Tests\Feature;

use App\Models\Career;
use App\Models\User;
use App\Models\WaitlistEntry;
use App\Support\Accounts;
use App\Support\AuditLog;
use Filament\Auth\Pages\Login;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;
use Spatie\Activitylog\Models\Activity;
use Tests\GoogleTokens;
use Tests\TestCase;

/**
 * The audit log (docs/seguranca.md, "Auditoria"): content changes with who and what, sign-ins and their failures,
 * the team's actions; never an email nor a full IP.
 */
class AuditLogTest extends TestCase
{
    use GoogleTokens, RefreshDatabase;

    public function test_a_content_change_keeps_who_the_old_and_the_new_value(): void
    {
        $editor = User::factory()->editor()->create();
        $career = Career::factory()->create(['slug' => 'enfermeiro']);
        $this->actingAs($editor);

        $career->update(['slug' => 'enfermeira']);

        $activity = Activity::query()->where('subject_type', $career->getMorphClass())->where('event', 'updated')->sole();
        $this->assertTrue($activity->causer?->is($editor));
        $this->assertSame('enfermeira', data_get($activity->attribute_changes, 'attributes.slug'));
        $this->assertSame('enfermeiro', data_get($activity->attribute_changes, 'old.slug'));
    }

    public function test_personal_data_is_never_copied_into_the_log(): void
    {
        WaitlistEntry::factory()->create(['email' => 'ana@example.com']);

        $this->assertSame(0, Activity::query()->where('subject_type', (new WaitlistEntry)->getMorphClass())->count());
        $this->assertStringNotContainsString('ana@example.com', (string) json_encode(Activity::query()->get()->toArray()));
    }

    public function test_an_android_sign_in_and_a_failed_one_are_logged_without_the_email(): void
    {
        $this->fakeGoogleKeys();

        $this->postJson('/api/v1/auth/google', ['id_token' => $this->googleToken()])->assertOk();
        $this->postJson('/api/v1/auth/google', ['id_token' => $this->googleToken(['aud' => 'other-app'])])->assertUnauthorized();

        $login = Activity::query()->where('log_name', AuditLog::AUTH)->where('event', 'login')->sole();
        $this->assertTrue($login->causer?->is(User::query()->sole()));
        $this->assertSame('android', data_get($login->properties, 'channel'));
        $this->assertSame('127.0.0.0', data_get($login->properties, 'ip_prefix'));

        $failed = Activity::query()->where('log_name', AuditLog::AUTH)->where('event', 'login_failed')->sole();
        $this->assertSame('invalid_token', data_get($failed->properties, 'reason'));
        $this->assertNull($failed->causer_id);
        $this->assertStringNotContainsString('joana@example.com', (string) json_encode(Activity::query()->get()->toArray()));
    }

    public function test_a_wrong_panel_password_is_logged_with_a_hash_of_the_email(): void
    {
        User::factory()->admin()->create(['email' => 'boss@kaye.test']);
        Filament::setCurrentPanel(Filament::getPanel('admin'));

        Livewire::test(Login::class)
            ->fillForm(['email' => 'boss@kaye.test', 'password' => 'wrong'])
            ->call('authenticate')
            ->assertHasFormErrors(['email']);

        $failed = Activity::query()->where('event', 'login_failed')->sole();
        $this->assertSame('panel', data_get($failed->properties, 'channel'));
        $this->assertSame(AuditLog::emailHash('boss@kaye.test'), data_get($failed->properties, 'email_hash'));
        $this->assertStringNotContainsString('boss@kaye.test', (string) json_encode($failed->toArray()));
    }

    public function test_the_csv_export_and_a_role_change_are_logged(): void
    {
        config(['kaye.waitlist_export_token' => str_repeat('e', 20)]);
        $this->get('/api/v1/waitlist/export', ['X-Export-Token' => str_repeat('e', 20)])->assertOk();
        $user = User::factory()->create();
        $user->assignRole('editor');

        $this->assertSame('token', data_get(Activity::query()->where('event', 'csv_export')->sole()->properties, 'channel'));
        $role = Activity::query()->where('event', 'role_given')->sole();
        $this->assertTrue($role->subject?->is($user));
        $this->assertSame(['editor'], data_get($role->properties, 'roles'));
    }

    public function test_deleting_the_account_deletes_its_sign_ins(): void
    {
        $user = User::factory()->create();
        AuditLog::signedIn($user, 'web');

        app(Accounts::class)->delete($user);

        $this->assertSame(0, Activity::query()->where('log_name', AuditLog::AUTH)->count());
    }
}
