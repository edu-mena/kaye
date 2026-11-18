<?php

namespace Tests\Feature;

use App\Enums\ConsentKind;
use App\Models\Consent;
use App\Models\User;
use App\Support\Accounts;
use App\Support\Consents;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\PushKeys;
use Tests\TestCase;

/**
 * The consents of the notices (docs/seguranca.md, "Avisos"): where and from which truncated IP, news never for a
 * minor nor anyone whose age is unknown, and the browsers' subscriptions only while a push consent lasts.
 */
class NoticeConsentTest extends TestCase
{
    use PushKeys, RefreshDatabase;

    public function test_a_consent_keeps_the_version_the_source_and_a_truncated_ip(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->withServerVariables(['REMOTE_ADDR' => '197.149.12.34'])
            ->postJson('/api/v1/me/consents', ['kind' => 'email_service', 'version' => '2026-11-12'])
            ->assertCreated();

        $consent = Consent::query()->sole();
        $this->assertSame(ConsentKind::EmailService, $consent->kind);
        $this->assertSame('app', $consent->source);
        $this->assertSame('197.149.12.0', $consent->ip_prefix);
    }

    public function test_an_ip_keeps_only_its_network_part(): void
    {
        $this->assertSame('10.1.2.0', Consents::ipPrefix('10.1.2.3'));
        $this->assertSame('2001:db8:1::', Consents::ipPrefix('2001:db8:1:2:3:4:5:6'));
        $this->assertNull(Consents::ipPrefix('not an ip'));
        $this->assertNull(Consents::ipPrefix(null));
    }

    public function test_a_minor_or_someone_without_an_age_cannot_have_push_news(): void
    {
        foreach ([User::factory()->minor()->create(), User::factory()->create(['birth_year' => null])] as $user) {
            $this->actingAs($user)->postJson('/api/v1/me/consents', ['kind' => 'push_marketing', 'version' => '2026-11-12'])
                ->assertUnprocessable();
            $this->actingAs($user)->postJson('/api/v1/me/consents', ['kind' => 'push_service', 'version' => '2026-11-12'])
                ->assertCreated();
        }
        $this->assertFalse(Consent::query()->where('kind', 'push_marketing')->exists());
    }

    public function test_becoming_a_minor_withdraws_the_push_news(): void
    {
        $user = User::factory()->create();
        Consents::grant($user, ConsentKind::PushMarketing, '2026-11-12', 'app', null);

        app(Accounts::class)->syncProfile($user, (object) ['profile' => (object) ['birthYear' => (int) now()->year - 15]]);

        $this->assertFalse(Consents::has($user, ConsentKind::PushMarketing));
    }

    public function test_the_browser_subscribes_only_with_a_push_consent(): void
    {
        $user = User::factory()->create();
        $body = ['endpoint' => 'https://push.example.com/one', 'keys' => ['p256dh' => 'BKey', 'auth' => 'secret']];

        $this->actingAs($user)->postJson('/api/v1/me/push-subscriptions', $body)->assertForbidden();
        Consents::grant($user, ConsentKind::PushService, '2026-11-12', 'app', null);
        $this->actingAs($user)->postJson('/api/v1/me/push-subscriptions', $body)->assertCreated();
        $this->actingAs($user)->postJson('/api/v1/me/push-subscriptions', $body)->assertOk();

        $this->assertSame(['https://push.example.com/one'], $user->pushSubscriptions()->pluck('endpoint')->all());
    }

    public function test_a_subscription_must_be_a_push_service_over_https(): void
    {
        $user = User::factory()->create();
        Consents::grant($user, ConsentKind::PushService, '2026-11-12', 'app', null);

        $this->actingAs($user)->postJson('/api/v1/me/push-subscriptions', ['endpoint' => 'http://push.example.com/x', 'keys' => ['p256dh' => 'k', 'auth' => 'a']])
            ->assertUnprocessable();
        $this->actingAs($user)->postJson('/api/v1/me/push-subscriptions', ['endpoint' => 'https://push.example.com/x'])
            ->assertUnprocessable();
    }

    public function test_only_a_signed_in_person_subscribes(): void
    {
        $this->postJson('/api/v1/me/push-subscriptions', ['endpoint' => 'https://push.example.com/x'])->assertUnauthorized();
        $this->deleteJson('/api/v1/me/push-subscriptions', ['endpoint' => 'https://push.example.com/x'])->assertUnauthorized();
    }

    public function test_the_browser_can_end_its_subscription(): void
    {
        $user = User::factory()->create();
        $this->subscribed($user, 'https://push.example.com/one');

        $this->actingAs($user)->deleteJson('/api/v1/me/push-subscriptions', ['endpoint' => 'https://push.example.com/one'])->assertNoContent();

        $this->assertSame(0, $user->pushSubscriptions()->count());
    }

    public function test_withdrawing_the_last_push_consent_removes_the_subscriptions(): void
    {
        $user = User::factory()->create();
        $this->subscribed($user, 'https://push.example.com/one');
        Consents::grant($user, ConsentKind::PushMarketing, '2026-11-12', 'app', null);

        $this->actingAs($user)->deleteJson('/api/v1/me/consents/push_marketing')->assertNoContent();
        $this->assertSame(1, $user->pushSubscriptions()->count());

        $this->actingAs($user)->deleteJson('/api/v1/me/consents/push_service')->assertNoContent();
        $this->assertSame(0, $user->pushSubscriptions()->count());
    }

    public function test_the_public_key_is_given_only_when_push_is_on(): void
    {
        config(['webpush.vapid.public_key' => null]);
        $this->getJson('/api/v1/push/key')->assertOk()->assertExactJson(['key' => null]);

        $this->useVapidKeys();
        $key = $this->getJson('/api/v1/push/key')->assertOk()->json('key');
        $this->assertIsString($key);
        $this->assertSame(config('webpush.vapid.public_key'), $key);
    }

    public function test_the_export_and_the_deletion_include_the_subscriptions(): void
    {
        $user = User::factory()->create();
        $this->subscribed($user, 'https://push.example.com/one');

        $this->actingAs($user)->getJson('/api/v1/me/export')
            ->assertOk()
            ->assertJsonPath('pushSubscriptions.0.endpoint', 'https://push.example.com/one')
            ->assertJsonPath('consents.0.source', 'app');

        $this->actingAs($user)->deleteJson('/api/v1/me')->assertNoContent();
        $this->assertDatabaseCount('push_subscriptions', 0);
    }
}
