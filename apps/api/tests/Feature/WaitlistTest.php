<?php

namespace Tests\Feature;

use App\Models\Feedback;
use App\Models\WaitlistEntry;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Testing\TestResponse;
use Tests\TestCase;

/**
 * POST /waitlist and /feedback: the same rules and answers as the Vercel functions (apps/web/api/_waitlist.ts).
 */
class WaitlistTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @param  array<string, mixed>  $overrides
     * @return TestResponse<\Illuminate\Http\JsonResponse>
     */
    private function join(array $overrides = [], string $ip = '10.0.0.1'): TestResponse
    {
        return $this->withServerVariables(['REMOTE_ADDR' => $ip])->postJson('/api/v1/waitlist', [
            'name' => ' Ana ',
            'email' => ' Ana@Example.com ',
            'whatsapp' => '923 456 789',
            'consent' => true,
            'website' => '',
            'source' => 'onboarding',
            'lang' => 'fr',
            ...$overrides,
        ]);
    }

    public function test_a_signup_is_kept_clean(): void
    {
        $this->join()
            ->assertCreated()
            ->assertExactJson(['ok' => true])
            ->assertHeader('Cache-Control', 'no-store, private')
            ->assertHeader('X-Robots-Tag', 'noindex, nofollow');

        $entry = WaitlistEntry::query()->sole();
        $this->assertSame('Ana', $entry->name);
        $this->assertSame('ana@example.com', $entry->email);
        $this->assertSame('+244923456789', $entry->whatsapp);
        $this->assertSame('onboarding', $entry->source);
        $this->assertSame('fr', $entry->locale);
        $this->assertTrue($entry->consent_at->isToday());
    }

    public function test_only_an_email_or_only_a_number_is_enough(): void
    {
        $this->join(['whatsapp' => ''])->assertCreated();
        $this->join(['email' => 'other@example.com', 'whatsapp' => '+351 912 345 678'])->assertCreated();
        $this->join(['email' => '', 'whatsapp' => '931111111'])->assertCreated();

        $this->assertSame([null, '+351912345678', '+244931111111'], WaitlistEntry::query()->orderBy('id')->pluck('whatsapp')->all());
        $this->assertNull(WaitlistEntry::query()->where('whatsapp', '+244931111111')->value('email'));
    }

    public function test_the_plus_list_keeps_its_own_source(): void
    {
        $this->join(['source' => 'plus'])->assertCreated();

        $this->assertSame('plus', WaitlistEntry::query()->sole()->source);
    }

    public function test_unknown_source_and_language_fall_back(): void
    {
        $this->join(['source' => 'ads', 'lang' => 'de'])->assertCreated();

        $entry = WaitlistEntry::query()->sole();
        $this->assertSame(['landing', 'pt'], [$entry->source, $entry->locale]);
    }

    public function test_a_known_email_or_number_is_not_added_twice(): void
    {
        $this->join()->assertCreated();

        $this->join(['whatsapp' => ''])->assertOk()->assertExactJson(['ok' => true, 'already' => true]);
        $this->join(['email' => '', 'whatsapp' => '+244 923-456-789'])->assertOk()->assertJson(['already' => true]);
        $this->assertSame(1, WaitlistEntry::query()->count());
    }

    public function test_the_honeypot_succeeds_and_keeps_nothing(): void
    {
        $this->join(['website' => 'https://spam.example'])->assertCreated()->assertExactJson(['ok' => true]);

        $this->assertSame(0, WaitlistEntry::query()->count());
    }

    /**
     * @return array<string, array{array<string, mixed>}>
     */
    public static function invalidSignups(): array
    {
        return [
            'no consent' => [['consent' => false]],
            'consent as text' => [['consent' => 'true']],
            'invalid email' => [['email' => 'ana@nowhere']],
            'invalid number' => [['whatsapp' => '12ab']],
            'no contact' => [['email' => '', 'whatsapp' => '']],
            'name too long' => [['name' => str_repeat('a', 81)]],
            'email not text' => [['email' => ['ana@example.com']]],
        ];
    }

    /**
     * @param  array<string, mixed>  $overrides
     */
    #[\PHPUnit\Framework\Attributes\DataProvider('invalidSignups')]
    public function test_an_invalid_signup_is_refused(array $overrides): void
    {
        $this->join($overrides)->assertUnprocessable()->assertExactJson(['error' => 'invalid']);

        $this->assertSame(0, WaitlistEntry::query()->count());
    }

    public function test_a_body_that_is_not_a_json_object_or_too_long_is_refused(): void
    {
        $this->call('POST', '/api/v1/waitlist', [], [], [], ['CONTENT_TYPE' => 'application/json', 'HTTP_ACCEPT' => 'application/json'], 'not json')
            ->assertUnprocessable();
        $this->postJson('/api/v1/waitlist', ['a', 'b'])->assertUnprocessable();
        $this->join(['padding' => str_repeat('x', 8_000)])->assertUnprocessable();
    }

    public function test_ten_signups_per_hour_per_ip_then_too_many(): void
    {
        for ($i = 0; $i < 10; $i++) {
            $this->join(['email' => "p{$i}@example.com", 'whatsapp' => ''])->assertCreated();
        }

        $this->join(['email' => 'p10@example.com', 'whatsapp' => ''])
            ->assertTooManyRequests()
            ->assertExactJson(['error' => 'too_many'])
            ->assertHeader('Retry-After');
        $this->join(['email' => 'p11@example.com', 'whatsapp' => ''], '10.0.0.2')->assertCreated();
        // Each endpoint counts apart: the feedback form still works.
        $this->withServerVariables(['REMOTE_ADDR' => '10.0.0.1'])
            ->postJson('/api/v1/feedback', ['kind' => 'idea', 'message' => 'Mais cursos'])
            ->assertCreated();
    }

    public function test_feedback_is_kept_clean(): void
    {
        $this->postJson('/api/v1/feedback', ['kind' => 'bug', 'message' => '  O botão falha  ', 'page' => 'support', 'lang' => 'en', 'website' => ''])
            ->assertCreated()
            ->assertExactJson(['ok' => true]);
        $this->postJson('/api/v1/feedback', ['kind' => 'critique', 'message' => 'Lento', 'page' => 'home'])->assertCreated();

        $rows = Feedback::query()->orderBy('id')->get(['kind', 'message', 'page', 'locale', 'status'])->toArray();
        $this->assertSame([
            ['kind' => 'bug', 'message' => 'O botão falha', 'page' => 'support', 'locale' => 'en', 'status' => 'new'],
            ['kind' => 'critique', 'message' => 'Lento', 'page' => 'landing', 'locale' => 'pt', 'status' => 'new'],
        ], $rows);
    }

    /**
     * @return array<string, array{array<string, mixed>}>
     */
    public static function invalidFeedback(): array
    {
        return [
            'unknown kind' => [['kind' => 'praise', 'message' => 'Muito bom']],
            'too short' => [['kind' => 'idea', 'message' => ' a ']],
            'too long' => [['kind' => 'idea', 'message' => str_repeat('a', 2001)]],
            'no message' => [['kind' => 'idea']],
        ];
    }

    /**
     * @param  array<string, mixed>  $body
     */
    #[\PHPUnit\Framework\Attributes\DataProvider('invalidFeedback')]
    public function test_invalid_feedback_is_refused(array $body): void
    {
        $this->postJson('/api/v1/feedback', $body)->assertUnprocessable()->assertExactJson(['error' => 'invalid']);

        $this->assertSame(0, Feedback::query()->count());
    }

    public function test_feedback_from_a_bot_is_dropped(): void
    {
        $this->postJson('/api/v1/feedback', ['kind' => 'idea', 'message' => 'Compre já', 'website' => 'x'])->assertCreated();

        $this->assertSame(0, Feedback::query()->count());
    }

    public function test_ten_feedbacks_per_hour_per_ip_then_too_many(): void
    {
        for ($i = 0; $i < 10; $i++) {
            $this->postJson('/api/v1/feedback', ['kind' => 'idea', 'message' => "Ideia {$i}"])->assertCreated();
        }

        $this->postJson('/api/v1/feedback', ['kind' => 'idea', 'message' => 'Mais uma'])
            ->assertTooManyRequests()
            ->assertExactJson(['error' => 'too_many']);
    }
}
