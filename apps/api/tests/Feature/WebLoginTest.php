<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Laravel\Sanctum\Sanctum;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\InvalidStateException;
use Laravel\Socialite\Two\User as GoogleUser;
use Mockery;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Tests\TestCase;

/**
 * The web login (ADR 0003): Google's OAuth, then a session in an HttpOnly, SameSite=Lax cookie,
 * with CSRF on every write. Android's token never needs CSRF.
 */
class WebLoginTest extends TestCase
{
    use RefreshDatabase;

    private const APP = 'https://kaye.test';

    protected function setUp(): void
    {
        parent::setUp();
        Config::set('sanctum.stateful', ['kaye.test']);
        // Laravel skips the CSRF check in tests; this one checks, as production does.
        Config::set('sanctum.middleware.validate_csrf_token', CsrfCheckedInTests::class);
    }

    public function test_the_redirect_goes_to_google_and_remembers_only_a_local_path(): void
    {
        $this->fakeRedirect();
        $this->get('/auth/google/redirect?next=/carreiras')->assertRedirect('https://accounts.google.com/o/oauth2/auth');
        $this->assertSame('/carreiras', session('login.next'));

        foreach (['//evil.example', 'https://evil.example', '/\\evil.example'] as $outside) {
            $this->fakeRedirect();
            $this->get('/auth/google/redirect?next='.urlencode($outside));
            $this->assertSame('/', session('login.next'), $outside);
        }
    }

    public function test_the_callback_signs_in_with_a_new_session_and_goes_back_to_the_app(): void
    {
        $this->fakeGoogleUser();

        $response = $this->withSession(['login.next' => '/plano'])->get('/auth/google/callback');

        $response->assertRedirect('/plano');
        $user = User::query()->sole();
        $this->assertSame('google-sub-1', $user->google_sub);
        $this->assertAuthenticatedAs($user, 'web');
    }

    public function test_the_session_cookie_is_http_only_and_same_site_lax(): void
    {
        Config::set('session.driver', 'database');
        $this->fakeGoogleUser();

        $cookie = collect($this->get('/auth/google/callback')->headers->getCookies())
            ->first(fn (Cookie $cookie): bool => $cookie->getName() === Config::string('session.cookie'));

        $this->assertNotNull($cookie);
        $this->assertTrue($cookie->isHttpOnly());
        $this->assertSame('lax', $cookie->getSameSite());
    }

    public function test_a_failed_or_forged_callback_does_not_sign_in(): void
    {
        $provider = Mockery::mock();
        $provider->shouldReceive('user')->andThrow(new InvalidStateException);
        Socialite::shouldReceive('driver')->with('google')->andReturn($provider);

        $this->get('/auth/google/callback?state=forged&code=x')->assertRedirect('/?login=failed');
        $this->assertGuest('web');
        $this->assertSame(0, User::query()->count());
    }

    public function test_a_google_account_without_a_verified_email_does_not_sign_in(): void
    {
        $this->fakeGoogleUser(verified: false);

        $this->get('/auth/google/callback')->assertRedirect('/?login=failed');
        $this->assertGuest('web');
    }

    public function test_a_closed_account_does_not_sign_in(): void
    {
        User::factory()->create(['google_sub' => 'google-sub-1'])->delete();
        $this->fakeGoogleUser();

        $this->get('/auth/google/callback')->assertRedirect('/?login=closed');
        $this->assertGuest('web');
    }

    public function test_a_write_from_the_web_session_without_the_csrf_token_is_refused(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'web')
            ->withHeader('Origin', self::APP)
            ->withSession(['_token' => 'the-real-token'])
            ->putJson('/api/v1/me/data', ['version' => 0, 'data' => ['version' => 1]])
            ->assertStatus(419);

        $this->assertNull($user->userData()->first());
    }

    public function test_a_write_from_the_web_session_with_the_csrf_token_works(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'web')
            ->withHeaders(['Origin' => self::APP, 'X-CSRF-TOKEN' => 'the-real-token'])
            ->withSession(['_token' => 'the-real-token'])
            ->putJson('/api/v1/me/data', ['version' => 0, 'data' => ['version' => 1]])
            ->assertOk();
    }

    public function test_the_android_app_uses_its_token_without_csrf(): void
    {
        // The Capacitor app's origin is https://localhost: never a browser session of the site.
        $this->assertNotContains('localhost', Config::array('sanctum.stateful'));
        Sanctum::actingAs(User::factory()->create());

        $this->withHeader('Origin', 'https://localhost')
            ->putJson('/api/v1/me/data', ['version' => 0, 'data' => ['version' => 1]])
            ->assertOk();
    }

    public function test_the_default_stateful_domain_is_only_the_app_url(): void
    {
        Config::set('app.url', 'https://kaye.ao');
        $config = require config_path('sanctum.php');

        $this->assertIsArray($config);
        $this->assertSame(['kaye.ao'], $config['stateful']);
    }

    public function test_logging_out_ends_the_web_session(): void
    {
        $this->actingAs(User::factory()->create(), 'web')
            ->withHeaders(['Origin' => self::APP, 'X-CSRF-TOKEN' => 'the-real-token'])
            ->withSession(['_token' => 'the-real-token'])
            ->postJson('/api/v1/auth/logout')
            ->assertNoContent();

        $this->assertGuest('web');
    }

    public function test_the_account_routes_need_a_login(): void
    {
        foreach (['/api/v1/me', '/api/v1/me/data', '/api/v1/me/export', '/api/v1/me/consents'] as $path) {
            $this->getJson($path)->assertUnauthorized();
        }
        $this->deleteJson('/api/v1/me')->assertUnauthorized();
    }

    public function test_a_guest_without_an_accept_header_gets_401_not_a_server_error(): void
    {
        // A browser tab or a crawler asks without "Accept: application/json"; the API must not try to redirect it.
        $this->get('/api/v1/me')
            ->assertUnauthorized()
            ->assertExactJson(['message' => 'Unauthenticated.']);
    }

    private function fakeRedirect(): void
    {
        $provider = Mockery::mock();
        $provider->shouldReceive('redirect')->andReturn(new RedirectResponse('https://accounts.google.com/o/oauth2/auth'));
        Socialite::shouldReceive('driver')->with('google')->andReturn($provider);
    }

    private function fakeGoogleUser(bool $verified = true): void
    {
        $google = (new GoogleUser)
            ->setRaw(['sub' => 'google-sub-1', 'email' => 'joana@example.com', 'email_verified' => $verified])
            ->map(['id' => 'google-sub-1', 'name' => 'Joana Silva', 'email' => 'joana@example.com', 'avatar' => 'https://lh3.googleusercontent.com/a/joana']);
        $provider = Mockery::mock();
        $provider->shouldReceive('user')->andReturn($google);
        Socialite::shouldReceive('driver')->with('google')->andReturn($provider);
    }
}

/**
 * Laravel's CSRF middleware, without its exception for tests.
 */
class CsrfCheckedInTests extends ValidateCsrfToken
{
    protected function runningUnitTests(): bool
    {
        return false;
    }
}
