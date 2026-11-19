<?php

namespace Tests\Feature;

use App\Models\Interview;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Testing\TestResponse;
use Tests\TestCase;

/**
 * POST /interviews: the same rules and answers as apps/web/api/_interviews.ts.
 */
class InterviewSubmissionTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return array<string, mixed>
     */
    private static function interview(): array
    {
        return [
            'area' => 'saude',
            'career' => ['slug' => 'enfermeiro', 'name' => 'Enfermeiro'],
            'locale' => 'pt',
            'startedAt' => '2026-11-18T09:00:00.000Z',
            'candidate' => [
                'name' => ' Bruno ', 'birthYear' => 2008, 'province' => 'Luanda', 'contact' => '923 456 789',
                'guardianInformed' => true,
            ],
            'answers' => [
                ['questionId' => 'q1', 'question' => 'Fala de ti', 'answer' => 'Sou o Bruno', 'seconds' => 41.6, 'dictated' => false],
            ],
            'extra' => 'dropped',
        ];
    }

    /**
     * @param  array<string, mixed>  $body
     * @return TestResponse<\Illuminate\Http\JsonResponse>
     */
    private function send(array $body): TestResponse
    {
        return $this->postJson('/api/v1/interviews', $body);
    }

    public function test_an_interview_is_kept_with_the_contact_encrypted(): void
    {
        $id = $this->send(self::interview())->assertCreated()->json('id');
        $this->assertIsString($id);
        $this->assertMatchesRegularExpression('/^[A-Za-z0-9_-]{12}$/', $id);

        $interview = Interview::query()->sole();
        $this->assertSame($id, $interview->public_id);
        $this->assertSame(['saude', 'enfermeiro', 'Enfermeiro', 'received'], [$interview->area, $interview->career_slug, $interview->career_name, $interview->status]);
        $this->assertSame(['name' => 'Bruno', 'birthYear' => 2008, 'province' => 'Luanda', 'contact' => '923 456 789', 'guardianInformed' => true], $interview->candidate);
        $this->assertSame(42, $interview->answers[0]['seconds']);
        $raw = DB::table('interviews')->value('candidate');
        $this->assertIsString($raw);
        $this->assertStringNotContainsString('Bruno', $raw);
        $this->assertStringNotContainsString('923', $raw);
    }

    public function test_the_career_is_optional(): void
    {
        $body = self::interview();
        unset($body['career']);

        $this->send($body)->assertCreated();
        $this->assertNull(Interview::query()->sole()->career_slug);
    }

    /**
     * @return array<string, array{string, mixed}>
     */
    public static function invalidFields(): array
    {
        return [
            'unknown area' => ['area', 'Saúde'],
            'unknown locale' => ['locale', 'de'],
            'bad date' => ['startedAt', 'yesterday-ish'],
            'bad career slug' => ['career', ['slug' => 'Enfermeiro!', 'name' => 'Enfermeiro']],
            'career not an object' => ['career', 'enfermeiro'],
            'no answers' => ['answers', []],
            'too many answers' => ['answers', array_fill(0, 13, ['questionId' => 'q', 'question' => 'Q', 'answer' => '', 'seconds' => 1, 'dictated' => false])],
            'answer too long' => ['answers', [['questionId' => 'q', 'question' => 'Q', 'answer' => str_repeat('a', 4001), 'seconds' => 1, 'dictated' => false]]],
            'too many seconds' => ['answers', [['questionId' => 'q', 'question' => 'Q', 'answer' => 'a', 'seconds' => 601, 'dictated' => false]]],
            'dictated not a boolean' => ['answers', [['questionId' => 'q', 'question' => 'Q', 'answer' => 'a', 'seconds' => 1, 'dictated' => 'no']]],
            'no candidate' => ['candidate', null],
        ];
    }

    #[\PHPUnit\Framework\Attributes\DataProvider('invalidFields')]
    public function test_an_invalid_field_is_refused(string $field, mixed $value): void
    {
        $this->send([...self::interview(), $field => $value])->assertUnprocessable()->assertExactJson(['error' => 'invalid']);

        $this->assertSame(0, Interview::query()->count());
    }

    /**
     * @return array<string, array{string, mixed}>
     */
    public static function invalidCandidates(): array
    {
        return [
            'invalid contact' => ['contact', 'call me maybe'],
            'invalid email' => ['contact', 'bruno@nowhere'],
            'birth date instead of year' => ['birthYear', '2008-05-01'],
            'guardian not a boolean' => ['guardianInformed', 'yes'],
            'empty name' => ['name', '  '],
        ];
    }

    #[\PHPUnit\Framework\Attributes\DataProvider('invalidCandidates')]
    public function test_an_invalid_candidate_is_refused(string $field, mixed $value): void
    {
        $candidate = ['name' => 'Bruno', 'birthYear' => 2008, 'contact' => 'bruno@example.com', 'guardianInformed' => true];

        $this->send([...self::interview(), 'candidate' => [...$candidate, $field => $value]])->assertUnprocessable();
    }

    public function test_six_interviews_per_hour_per_ip_then_too_many(): void
    {
        for ($i = 0; $i < 6; $i++) {
            $this->send(self::interview())->assertCreated();
        }

        $this->send(self::interview())->assertTooManyRequests()->assertExactJson(['error' => 'too_many']);
        $this->assertSame(6, Interview::query()->count());
    }

    public function test_interviews_older_than_12_months_are_pruned(): void
    {
        $this->send(self::interview())->assertCreated();
        $this->send(self::interview())->assertCreated();
        Interview::query()->first()?->forceFill(['created_at' => now()->subMonths(12)->subDay()])->save();

        $this->assertSame(0, Artisan::call('model:prune', ['--model' => [Interview::class]]));

        $this->assertSame(1, Interview::query()->count());
    }
}
