<?php

namespace Tests\Feature;

use App\Models\Feedback;
use App\Models\Interview;
use App\Models\PublicCard;
use App\Models\WaitlistEntry;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Sleep;
use Tests\TestCase;

/**
 * `php artisan kaye:migrate-redis` against a fake Upstash REST API holding what the Vercel functions wrote.
 */
class MigrateRedisTest extends TestCase
{
    use RefreshDatabase;

    private const URL = 'https://kaye-test.upstash.io';

    /**
     * The Redis lists the Vercel functions wrote: JSON strings.
     *
     * @var array<string, list<string>>
     */
    private array $lists;

    /**
     * The Redis string keys: card:<slug> and a rate counter.
     *
     * @var array<string, string>
     */
    private array $keys;

    /**
     * Every command sent to Upstash.
     *
     * @var list<list<mixed>>
     */
    private array $commands = [];

    private bool $down = false;

    protected function setUp(): void
    {
        parent::setUp();
        config(['services.upstash.url' => self::URL, 'services.upstash.token' => 'upstash-token']);

        $card = fn (string $name): string => json_encode(['card' => ['name' => $name, 'accent' => '#ffc000'], 'secretHash' => hash('sha256', $name)], JSON_THROW_ON_ERROR);
        $json = fn (array $item): string => json_encode($item, JSON_THROW_ON_ERROR);
        $this->lists = [
            'waitlist' => array_map($json, [
                ['name' => 'Ana', 'email' => 'ana@example.com', 'whatsapp' => '+244923456789', 'source' => 'landing', 'lang' => 'pt', 'date' => '2026-11-10T08:00:00.123Z'],
                ['name' => '', 'email' => '', 'whatsapp' => '+244931111111', 'source' => 'onboarding', 'lang' => 'fr', 'date' => '2026-11-11T09:00:00.000Z'],
            ]),
            'feedback' => array_map($json, [
                ['kind' => 'idea', 'message' => 'Mais cursos', 'page' => 'landing', 'lang' => 'pt', 'date' => '2026-11-12T10:00:00.500Z'],
                ['kind' => 'bug', 'message' => 'Falha', 'page' => 'support', 'lang' => 'en', 'date' => '2026-11-12T11:00:00.000Z'],
            ]),
            // LPUSH: the newest first.
            'interviews' => array_map($json, [
                self::interview('newer000002', '2026-11-14T10:00:00.000Z'),
                self::interview('older000001', '2026-11-13T10:00:00.000Z'),
            ]),
        ];
        $this->keys = [
            'card:slugAAAAAAAA' => $card('Carla'),
            'card:slugBBBBBBBB' => $card('Dário'),
            'rate:10.0.0.1' => '3',
        ];

        Http::preventStrayRequests();
        Http::fake([self::URL => fn (Request $request) => $this->down
            ? Http::response(['error' => 'WRONGPASS'], 401)
            : Http::response(['result' => $this->answer($request)])]);
        Sleep::fake();
    }

    /**
     * @return array<string, mixed>
     */
    private static function interview(string $id, string $receivedAt): array
    {
        return [
            'id' => $id, 'receivedAt' => $receivedAt, 'status' => 'pending', 'area' => 'saude',
            'career' => ['slug' => 'enfermeiro', 'name' => 'Enfermeiro'], 'locale' => 'pt', 'startedAt' => '2026-11-13T09:50:00.000Z',
            'candidate' => ['name' => 'Bruno', 'birthYear' => 2008, 'contact' => '+244923000000', 'guardianInformed' => true],
            'answers' => [['questionId' => 'q1', 'question' => 'Fala de ti', 'answer' => 'Olá', 'seconds' => 30, 'dictated' => false]],
        ];
    }

    /**
     * A tiny Upstash: the four commands the migration may send. Anything else fails the test.
     */
    private function answer(Request $request): mixed
    {
        $this->assertSame('Bearer upstash-token', $request->header('Authorization')[0] ?? null);
        /** @var list<mixed> $command */
        $command = $request->data();
        $this->commands[] = $command;

        return match ($command[0]) {
            'LRANGE' => is_string($command[1]) ? $this->lists[$command[1]] ?? [] : [],
            // Two pages, to follow the cursor.
            'SCAN' => $command[1] === '0'
                ? ['7', ['card:slugAAAAAAAA', 'rate:10.0.0.1']]
                : ['0', ['card:slugBBBBBBBB']],
            'MGET' => array_map(fn (mixed $key): mixed => is_string($key) ? $this->keys[$key] ?? null : null, array_slice($command, 1)),
            default => $this->fail('Unexpected Redis command '.json_encode($command)),
        };
    }

    public function test_everything_is_copied_once_and_counted(): void
    {
        WaitlistEntry::query()->create(['email' => 'ana@example.com', 'source' => 'landing', 'locale' => 'pt', 'consent_at' => now()]);

        $code = Artisan::call('kaye:migrate-redis');
        $output = Artisan::output();
        $this->assertSame(0, $code, $output);

        $this->assertMatchesRegularExpression('/waitlist\s*\|\s*2\s*\|\s*1\s*\|\s*1\s*\|\s*1\s*\|\s*0\s*\|\s*2/', $output);
        $this->assertMatchesRegularExpression('/public_cards\s*\|\s*2\s*\|\s*0\s*\|\s*2\s*\|\s*0\s*\|\s*0\s*\|\s*2/', $output);
        $this->assertStringContainsString('Every row in Redis is in MySQL.', $output);

        $number = WaitlistEntry::query()->withWhatsapp('+244931111111')->sole();
        $this->assertNull($number->email);
        $this->assertSame(['onboarding', 'fr', '2026-11-11 09:00:00'], [$number->source, $number->locale, $number->created_at->toDateTimeString()]);
        $this->assertSame('2026-11-11 09:00:00', $number->consent_at->toDateTimeString());

        $this->assertSame(['Mais cursos', 'Falha'], Feedback::query()->orderBy('id')->pluck('message')->all());
        $this->assertSame(['older000001', 'newer000002'], Interview::query()->orderBy('id')->pluck('public_id')->all());
        $interview = Interview::query()->where('public_id', 'older000001')->sole();
        $this->assertSame(['received', 'enfermeiro', 'Bruno'], [$interview->status, $interview->career_slug, $interview->candidate['name']]);
        $this->assertSame('2026-11-13 10:00:00', $interview->created_at->toDateTimeString());

        $card = PublicCard::query()->where('slug', 'slugBBBBBBBB')->sole();
        $this->assertSame(['name' => 'Dário', 'accent' => '#ffc000'], $card->card);
        $this->assertTrue($card->isOwnedBy('Dário'));
        // The rate counter is not a card, and Redis is only read.
        $this->assertSame(2, PublicCard::query()->count());
        $this->assertSame([], array_filter($this->commands, fn (array $command): bool => ! in_array($command[0], ['LRANGE', 'SCAN', 'MGET'], true)));
    }

    public function test_running_it_again_adds_nothing(): void
    {
        $this->assertSame(0, Artisan::call('kaye:migrate-redis'));
        $this->assertSame(0, Artisan::call('kaye:migrate-redis'));

        $this->assertSame([2, 2, 2, 2], [WaitlistEntry::query()->count(), Feedback::query()->count(), Interview::query()->count(), PublicCard::query()->count()]);
        $this->assertMatchesRegularExpression('/feedback\s*\|\s*2\s*\|\s*2\s*\|\s*0\s*\|\s*2\s*\|\s*0\s*\|\s*2/', Artisan::output());
    }

    public function test_a_dry_run_counts_and_writes_nothing(): void
    {
        $this->assertSame(0, Artisan::call('kaye:migrate-redis', ['--dry-run' => true]));
        $output = Artisan::output();

        $this->assertMatchesRegularExpression('/interviews\s*\|\s*2\s*\|\s*0\s*\|\s*2\s*\|\s*0\s*\|\s*0\s*\|\s*2/', $output);
        $this->assertStringContainsString('Dry run: nothing was written.', $output);
        $this->assertStringContainsString('Every row in Redis can be copied.', $output);
        $this->assertStringNotContainsString('is in MySQL', $output);
        $this->assertSame(0, Interview::query()->count() + WaitlistEntry::query()->count());
    }

    public function test_an_unreadable_row_is_reported_and_the_rest_is_copied(): void
    {
        $this->lists['feedback'][] = '{not json';
        $this->lists['waitlist'][] = (string) json_encode(['name' => 'Sem contacto', 'email' => '', 'whatsapp' => '', 'date' => '2026-11-12T00:00:00Z']);

        $this->assertSame(1, Artisan::call('kaye:migrate-redis'));

        $output = Artisan::output();
        $this->assertStringContainsString('feedback #2: not a JSON object', $output);
        $this->assertStringContainsString('waitlist #2: no email and no number', $output);
        $this->assertSame(2, Feedback::query()->count());
        $this->assertSame(2, WaitlistEntry::query()->count());
    }

    public function test_without_credentials_or_with_upstash_down_nothing_is_written(): void
    {
        config(['services.upstash.token' => '']);
        $this->assertSame(1, Artisan::call('kaye:migrate-redis'));
        $this->assertStringContainsString('UPSTASH_REDIS_REST_URL', Artisan::output());

        config(['services.upstash.token' => 'upstash-token']);
        $this->down = true;
        $this->assertSame(1, Artisan::call('kaye:migrate-redis'));
        $this->assertStringContainsString('Could not read Upstash', Artisan::output());
        $this->assertSame(0, WaitlistEntry::query()->count());
    }
}
