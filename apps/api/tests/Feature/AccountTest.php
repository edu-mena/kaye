<?php

namespace Tests\Feature;

use App\Enums\ConsentKind;
use App\Models\Consent;
use App\Models\User;
use App\Models\UserData;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\PersonalAccessToken;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/**
 * GET /me, the consents, the export and the deletion of the account (Lei n.º 22/11), and the
 * rules for minors: no marketing, no public profile, no salary reports.
 */
class AccountTest extends TestCase
{
    use RefreshDatabase;

    public function test_me_describes_the_account_without_the_google_id(): void
    {
        Sanctum::actingAs(User::factory()->create(['name' => 'Joana', 'email' => 'joana@example.com']));

        $this->getJson('/api/v1/me')->assertOk()
            ->assertJsonPath('name', 'Joana')
            ->assertJsonPath('minor', false)
            ->assertJsonPath('consents', [])
            ->assertJsonMissingPath('google_sub')
            ->assertJsonMissingPath('googleSub');
    }

    public function test_a_minor_cannot_give_a_marketing_consent(): void
    {
        $minor = User::factory()->minor()->create();
        Sanctum::actingAs($minor);

        foreach ([ConsentKind::EmailMarketing, ConsentKind::WhatsappMarketing] as $kind) {
            $this->postJson('/api/v1/me/consents', ['kind' => $kind->value, 'version' => '2026-11'])
                ->assertUnprocessable()->assertJsonValidationErrors('kind');
        }
        $this->assertSame(0, $minor->consents()->count());

        // Consents that are not marketing are fine.
        $this->postJson('/api/v1/me/consents', ['kind' => 'guardian_informed', 'version' => '2026-11'])->assertCreated();
    }

    public function test_without_a_birth_year_marketing_is_refused_too(): void
    {
        Sanctum::actingAs(User::factory()->create(['birth_year' => null]));

        $this->postJson('/api/v1/me/consents', ['kind' => 'email_marketing', 'version' => '2026-11'])->assertUnprocessable();
    }

    public function test_an_adult_gives_and_withdraws_consents_and_the_proof_stays(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->postJson('/api/v1/me/consents', ['kind' => 'email_marketing', 'version' => '2026-11'])
            ->assertCreated()->assertJsonPath('kind', 'email_marketing')->assertJsonPath('version', '2026-11');
        // The same consent again is not a second row.
        $this->postJson('/api/v1/me/consents', ['kind' => 'email_marketing', 'version' => '2026-11'])->assertOk();
        $this->postJson('/api/v1/me/consents', ['kind' => 'terms', 'version' => '2026-11'])->assertCreated();
        $this->getJson('/api/v1/me/consents')->assertJsonPath('*.kind', ['email_marketing', 'terms']);

        $this->deleteJson('/api/v1/me/consents/email_marketing')->assertNoContent();

        $this->getJson('/api/v1/me/consents')->assertJsonPath('*.kind', ['terms']);
        $this->getJson('/api/v1/me')->assertJsonPath('consents', ['terms']);
        $this->assertNotNull($user->consents()->where('kind', 'email_marketing')->value('revoked_at'));
    }

    public function test_an_unknown_consent_is_refused(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/v1/me/consents', ['kind' => 'sell_my_data', 'version' => '1'])->assertUnprocessable();
        $this->deleteJson('/api/v1/me/consents/sell_my_data')->assertNotFound();
    }

    public function test_the_rules_for_minors_fail_closed(): void
    {
        $year = (int) now()->year;
        $minor = User::factory()->make(['birth_year' => $year - 17]);
        $adult = User::factory()->make(['birth_year' => $year - 18]);
        $unknown = User::factory()->make(['birth_year' => null]);

        foreach ([$minor, $unknown] as $user) {
            $this->assertFalse($user->canReceiveMarketing());
            $this->assertFalse($user->canHavePublicProfile());
            $this->assertFalse($user->canReportSalaries());
        }
        $this->assertTrue($adult->canReceiveMarketing());
        $this->assertTrue($adult->canHavePublicProfile());
        $this->assertTrue($adult->canReportSalaries());
        $this->assertTrue($minor->isMinor());
        $this->assertFalse($unknown->isMinor());
    }

    public function test_the_export_has_everything_the_server_keeps_about_the_person(): void
    {
        $user = User::factory()->create(['email' => 'joana@example.com']);
        $user->createToken('Pixel 8');
        $user->consents()->create(['kind' => ConsentKind::Terms, 'version' => '2026-11', 'granted_at' => now()]);
        Sanctum::actingAs($user);
        $this->putJson('/api/v1/me/data', ['version' => 0, 'data' => ['version' => 1, 'savedCareers' => ['medico']]])->assertOk();

        $this->getJson('/api/v1/me/export')->assertOk()
            ->assertHeader('Content-Disposition', 'attachment; filename="kaye-os-meus-dados.json"')
            ->assertHeader('Cache-Control', 'no-store, private')
            ->assertJsonPath('account.email', 'joana@example.com')
            ->assertJsonPath('data.savedCareers', ['medico'])
            ->assertJsonPath('consents.0.kind', 'terms')
            ->assertJsonPath('devices.0.name', 'Pixel 8')
            ->assertJsonMissingPath('account.google_sub');
    }

    public function test_deleting_the_account_deletes_everything_that_is_the_persons(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $user->createToken('Pixel 8');
        $user->consents()->create(['kind' => ConsentKind::Terms, 'version' => '2026-11', 'granted_at' => now()]);
        $other->consents()->create(['kind' => ConsentKind::Terms, 'version' => '2026-11', 'granted_at' => now()]);
        DB::table('sessions')->insert(['id' => 'web-session', 'user_id' => $user->id, 'payload' => '', 'last_activity' => time()]);
        Sanctum::actingAs($user);
        $this->putJson('/api/v1/me/data', ['version' => 0, 'data' => ['version' => 1, 'savedCareers' => ['medico']]])->assertOk();

        $this->deleteJson('/api/v1/me')->assertNoContent();

        $this->assertNull(User::withTrashed()->find($user->id), 'Not a soft delete: the row is gone.');
        $this->assertSame(0, UserData::query()->count());
        $this->assertSame(0, Consent::query()->where('user_id', $user->id)->count());
        $this->assertSame(0, PersonalAccessToken::query()->where('tokenable_id', $user->id)->count());
        $this->assertSame(0, DB::table('sessions')->where('user_id', $user->id)->count());
        // Nobody else loses anything.
        $this->assertSame(1, $other->consents()->count());
    }

    public function test_logging_out_on_android_deletes_only_that_devices_token(): void
    {
        $user = User::factory()->create();
        $phone = $user->createToken('Pixel 8')->plainTextToken;
        $user->createToken('Tablet');

        $this->withToken($phone)->postJson('/api/v1/auth/logout')->assertNoContent();

        $this->assertSame(['Tablet'], $user->tokens()->pluck('name')->all());
        $this->app->make('auth')->forgetGuards();
        $this->withToken($phone)->getJson('/api/v1/me')->assertUnauthorized();
    }
}
