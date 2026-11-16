<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Testing\TestResponse;
use Laravel\Sanctum\PersonalAccessToken;
use Symfony\Component\HttpFoundation\Response;
use Tests\GoogleTokens;
use Tests\TestCase;

/**
 * POST /api/v1/auth/google: the Android app trades Google's ID token for a Sanctum token (ADR 0003).
 * Each check of the token (signature, `aud`, `iss`, `exp`, verified email) has a test that fails without it.
 */
class AndroidLoginTest extends TestCase
{
    use GoogleTokens, RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->fakeGoogleKeys();
    }

    public function test_a_valid_google_token_creates_the_account_and_a_token_for_30_days(): void
    {
        $response = $this->exchange($this->googleToken(), 'Pixel 8')->assertOk()
            ->assertJsonPath('user.email', 'joana@example.com')
            ->assertJsonPath('user.name', 'Joana Silva')
            ->assertJsonMissingPath('user.google_sub');

        $user = User::query()->sole();
        $this->assertSame('110000000000000000001', $user->google_sub);
        $this->assertNotNull($user->last_login_at);

        $plainToken = $response->json('token');
        $this->assertIsString($plainToken);
        $token = PersonalAccessToken::findToken($plainToken);
        $this->assertNotNull($token);
        $this->assertSame('Pixel 8', $token->name);
        $this->assertEqualsWithDelta(now()->addDays(30)->timestamp, $token->expires_at?->timestamp, 5);

        $this->withToken($plainToken)->getJson('/api/v1/me')->assertOk()->assertJsonPath('email', 'joana@example.com');
    }

    public function test_signing_in_again_finds_the_same_account(): void
    {
        $this->exchange($this->googleToken())->assertOk();
        $this->exchange($this->googleToken(['email' => 'joana.nova@example.com']))->assertOk();

        $this->assertSame('joana.nova@example.com', User::query()->sole()->email);
    }

    public function test_a_local_account_with_the_same_email_is_linked_not_duplicated(): void
    {
        $admin = User::factory()->admin()->create(['google_sub' => null, 'email' => 'joana@example.com']);

        $this->exchange($this->googleToken(['email' => 'Joana@Example.com']))->assertOk();

        $this->assertSame('110000000000000000001', $admin->refresh()->google_sub);
        $this->assertSame(1, User::query()->count());
    }

    public function test_a_token_issued_for_another_app_is_refused(): void
    {
        $this->exchange($this->googleToken(['aud' => 'other-app.apps.googleusercontent.com']))->assertUnauthorized();

        $this->assertSame(0, User::query()->count());
    }

    public function test_an_expired_token_is_refused(): void
    {
        $this->exchange($this->googleToken(['iat' => time() - 7200, 'exp' => time() - 3600]))->assertUnauthorized();

        $this->assertSame(0, User::query()->count());
    }

    public function test_a_token_signed_by_someone_else_is_refused(): void
    {
        $this->exchange($this->googleToken(signer: 'attacker'))->assertUnauthorized();
        $this->exchange($this->googleToken(signer: 'attacker', kid: 'attacker'))->assertUnauthorized();

        $this->assertSame(0, User::query()->count());
    }

    public function test_a_token_from_another_issuer_is_refused(): void
    {
        $this->exchange($this->googleToken(['iss' => 'https://evil.example']))->assertUnauthorized();
    }

    public function test_an_account_without_a_verified_email_is_refused(): void
    {
        $this->exchange($this->googleToken(['email_verified' => false]))->assertUnauthorized();
    }

    public function test_a_token_that_is_not_a_jwt_is_refused(): void
    {
        $this->exchange('not-a-token')->assertUnauthorized();
        $this->postJson('/api/v1/auth/google', [])->assertUnprocessable()->assertJsonValidationErrors('id_token');
    }

    public function test_nobody_signs_in_while_the_client_id_is_not_configured(): void
    {
        config(['services.google.audiences' => []]);

        $this->exchange($this->googleToken())->assertUnauthorized();
    }

    public function test_a_closed_account_does_not_come_back_by_signing_in(): void
    {
        User::factory()->create(['google_sub' => '110000000000000000001'])->delete();

        $this->exchange($this->googleToken())->assertForbidden();
    }

    public function test_google_keys_are_fetched_again_when_google_rotates_them(): void
    {
        $this->exchange($this->googleToken())->assertOk();
        Http::assertSentCount(1);

        // A key id the cached set does not have: fetched again, once.
        $this->exchange($this->googleToken(kid: 'rotated'))->assertUnauthorized();
        Http::assertSentCount(2);
    }

    public function test_an_expired_kaye_token_is_refused(): void
    {
        $token = $this->exchange($this->googleToken())->json('token');
        $this->assertIsString($token);

        $this->travel(31)->days();

        $this->withToken($token)->getJson('/api/v1/me')->assertUnauthorized();
    }

    public function test_the_login_is_limited_to_10_attempts_a_minute(): void
    {
        for ($attempt = 0; $attempt < 10; $attempt++) {
            $this->exchange('not-a-token')->assertUnauthorized();
        }

        $this->exchange('not-a-token')->assertTooManyRequests();
    }

    /**
     * @return TestResponse<Response>
     */
    private function exchange(string $idToken, ?string $device = null): TestResponse
    {
        return $this->postJson('/api/v1/auth/google', array_filter(['id_token' => $idToken, 'device_name' => $device]));
    }
}
