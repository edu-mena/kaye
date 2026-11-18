<?php

namespace App\Console\Commands;

use App\Models\Feedback;
use App\Models\Interview;
use App\Models\PublicCard;
use App\Models\WaitlistEntry;
use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use RuntimeException;
use Throwable;
use UnexpectedValueException;

/**
 * Copies what the Vercel functions kept in Upstash Redis (waiting list, feedback, interviews, public cards) into
 * MySQL, once, before the switch (ADR 0019). It never writes to Redis and never duplicates: a row already in
 * MySQL (same email or number, same feedback, same interview id, same card slug) is skipped, so it can run again.
 */
class MigrateRedis extends Command
{
    protected $signature = 'kaye:migrate-redis {--dry-run : Read and count, write nothing}';

    protected $description = 'Copy the waiting list, feedback, interviews and public cards from Upstash Redis to MySQL';

    /**
     * Rows Redis has that could not be read, as "list #index: why".
     *
     * @var list<string>
     */
    private array $problems = [];

    public function handle(): int
    {
        $url = Config::get('services.upstash.url');
        $token = Config::get('services.upstash.token');
        if (! is_string($url) || $url === '' || ! is_string($token) || $token === '') {
            $this->error('Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN (or KV_REST_API_URL and KV_REST_API_TOKEN) first.');

            return self::FAILURE;
        }

        try {
            $lists = [
                'waitlist' => $this->list($url, $token, 'waitlist'),
                'feedback' => $this->list($url, $token, 'feedback'),
                'interviews' => $this->list($url, $token, 'interviews'),
                'public_cards' => $this->cards($url, $token),
            ];
        } catch (Throwable $error) {
            $this->error("Could not read Upstash: {$error->getMessage()}. Nothing was written.");

            return self::FAILURE;
        }

        $before = $this->counts();
        DB::beginTransaction();
        try {
            $created = [
                'waitlist' => $this->each($lists['waitlist'], 'waitlist', $this->waitlist(...)),
                'feedback' => $this->each($lists['feedback'], 'feedback', $this->feedback(...)),
                // Redis kept the newest interview first: oldest first here, so the ids grow with the dates.
                'interviews' => $this->each(array_reverse($lists['interviews'], true), 'interviews', $this->interview(...)),
                'public_cards' => $this->each($lists['public_cards'], 'card', $this->card(...)),
            ];
            $after = $this->counts();
        } catch (Throwable $error) {
            DB::rollBack();

            throw $error;
        }
        $this->option('dry-run') === true ? DB::rollBack() : DB::commit();

        $this->table(
            ['Table', 'In Redis', 'MySQL before', 'Created', 'Already there', 'Unreadable', 'MySQL after'],
            array_map(fn (string $table): array => [
                $table,
                count($lists[$table]),
                $before[$table],
                $created[$table]['created'],
                $created[$table]['skipped'],
                $created[$table]['invalid'],
                $after[$table],
            ], array_keys($lists)),
        );

        if ($this->option('dry-run') === true) {
            $this->warn('Dry run: nothing was written.');
        }
        if ($this->problems !== []) {
            $this->error('Some rows could not be read and were not copied. They are still in Redis:');
            foreach ($this->problems as $problem) {
                $this->line("  - {$problem}");
            }

            return self::FAILURE;
        }
        $this->info('Every row in Redis is in MySQL.');

        return self::SUCCESS;
    }

    /**
     * @return array<string, int>
     */
    private function counts(): array
    {
        return [
            'waitlist' => WaitlistEntry::query()->count(),
            'feedback' => Feedback::query()->count(),
            'interviews' => Interview::query()->count(),
            'public_cards' => PublicCard::query()->count(),
        ];
    }

    /**
     * One Upstash REST command: POST the command as a JSON array, read `result`.
     *
     * @param  list<string|int>  $command
     */
    private function redis(string $url, string $token, array $command): mixed
    {
        return Http::withToken($token)->timeout(30)->retry(2, 500)->post($url, $command)->throw()->json('result');
    }

    /**
     * Every item of a Redis list, decoded; a broken one stays a string, to be reported.
     *
     * @return array<int, mixed>
     */
    private function list(string $url, string $token, string $key): array
    {
        $items = $this->redis($url, $token, ['LRANGE', $key, 0, -1]);

        return array_map(fn (mixed $item): mixed => is_string($item) ? json_decode($item, true) ?? $item : $item, is_array($items) ? array_values($items) : []);
    }

    /**
     * Every `card:<slug>` key, found with SCAN (never KEYS) and read with MGET, as [slug => stored].
     *
     * @return array<string, mixed>
     */
    private function cards(string $url, string $token): array
    {
        $keys = [];
        $cursor = '0';
        do {
            $page = $this->redis($url, $token, ['SCAN', $cursor, 'MATCH', 'card:*', 'COUNT', 500]);
            if (! is_array($page) || ! isset($page[0], $page[1]) || ! is_array($page[1])) {
                throw new RuntimeException('SCAN gave an unexpected answer');
            }
            $cursor = (string) (is_scalar($page[0]) ? $page[0] : '0');
            foreach ($page[1] as $key) {
                if (is_string($key) && str_starts_with($key, 'card:')) {
                    $keys[$key] = true;
                }
            }
        } while ($cursor !== '0');

        $cards = [];
        foreach (array_chunk(array_keys($keys), 100) as $chunk) {
            $values = $this->redis($url, $token, ['MGET', ...$chunk]);
            foreach ($chunk as $index => $key) {
                $value = is_array($values) ? ($values[$index] ?? null) : null;
                $cards[substr($key, strlen('card:'))] = is_string($value) ? json_decode($value, true) ?? $value : $value;
            }
        }

        return $cards;
    }

    /**
     * @param  array<array-key, mixed>  $items
     * @param  callable(array<string, mixed>, array-key): ?Model  $copy  the new row, or null when it was there
     * @return array{created: int, skipped: int, invalid: int}
     */
    private function each(array $items, string $name, callable $copy): array
    {
        $result = ['created' => 0, 'skipped' => 0, 'invalid' => 0];
        foreach ($items as $index => $item) {
            try {
                if (! is_array($item)) {
                    throw new UnexpectedValueException('not a JSON object');
                }
                /** @var array<string, mixed> $item */
                $copy($item, $index) === null ? $result['skipped']++ : $result['created']++;
            } catch (Throwable $error) {
                $result['invalid']++;
                $this->problems[] = "{$name} #{$index}: {$error->getMessage()}";
            }
        }

        return $result;
    }

    /**
     * @param  array<string, mixed>  $item
     */
    private function waitlist(array $item): ?WaitlistEntry
    {
        $email = self::string($item, 'email', allowEmpty: true);
        $whatsapp = self::string($item, 'whatsapp', allowEmpty: true);
        $email = $email === '' ? null : $email;
        $whatsapp = $whatsapp === '' ? null : $whatsapp;
        if ($email === null && $whatsapp === null) {
            throw new UnexpectedValueException('no email and no number');
        }
        if (WaitlistEntry::knows($email, $whatsapp)) {
            return null;
        }
        $date = self::date($item, 'date');

        return WaitlistEntry::query()->create([
            'name' => self::string($item, 'name', allowEmpty: true),
            'email' => $email,
            'whatsapp' => $whatsapp,
            'source' => self::string($item, 'source', allowEmpty: true) ?: 'landing',
            'locale' => self::string($item, 'lang', allowEmpty: true) ?: 'pt',
            'consent_at' => $date,
            'created_at' => $date,
            'updated_at' => $date,
        ]);
    }

    /**
     * Feedback has no id in Redis: the same date (to the second), kind and message is the same feedback.
     *
     * @param  array<string, mixed>  $item
     */
    private function feedback(array $item): ?Feedback
    {
        $date = self::date($item, 'date');
        $kind = self::string($item, 'kind');
        $message = self::string($item, 'message');
        $exists = Feedback::query()
            ->where('created_at', $date->copy()->startOfSecond())
            ->where('kind', $kind)
            ->where('message', $message)
            ->exists();

        return $exists ? null : Feedback::query()->create([
            'kind' => $kind,
            'message' => $message,
            'page' => self::string($item, 'page', allowEmpty: true) ?: 'landing',
            'locale' => self::string($item, 'lang', allowEmpty: true) ?: 'pt',
            'created_at' => $date,
            'updated_at' => $date,
        ]);
    }

    /**
     * @param  array<string, mixed>  $item
     */
    private function interview(array $item): ?Interview
    {
        $id = self::string($item, 'id');
        if (Interview::query()->where('public_id', $id)->exists()) {
            return null;
        }
        $career = is_array($item['career'] ?? null) ? $item['career'] : [];
        $candidate = $item['candidate'] ?? null;
        $answers = $item['answers'] ?? null;
        if (! is_array($candidate) || ! is_array($answers) || ! array_is_list($answers)) {
            throw new UnexpectedValueException('candidate or answers missing');
        }
        $date = self::date($item, 'receivedAt');

        return Interview::query()->create([
            'public_id' => $id,
            'area' => self::string($item, 'area'),
            'career_slug' => is_string($career['slug'] ?? null) ? $career['slug'] : null,
            'career_name' => is_string($career['name'] ?? null) ? $career['name'] : null,
            'locale' => self::string($item, 'locale'),
            'started_at' => self::date($item, 'startedAt'),
            'candidate' => $candidate,
            'answers' => $answers,
            // The Vercel list had one status, "pending": nobody had reviewed them in the app.
            'status' => 'received',
            'created_at' => $date,
            'updated_at' => $date,
        ]);
    }

    /**
     * @param  array<string, mixed>  $item
     */
    private function card(array $item, int|string $slug): ?PublicCard
    {
        $slug = (string) $slug;
        if (PublicCard::query()->where('slug', $slug)->exists()) {
            return null;
        }
        $card = $item['card'] ?? null;
        $secretHash = self::string($item, 'secretHash');
        if (! is_array($card) || $card === [] || preg_match('/^[0-9a-f]{64}$/', $secretHash) !== 1) {
            throw new UnexpectedValueException('card or secretHash missing');
        }

        return PublicCard::query()->create(['slug' => $slug, 'secret_hash' => $secretHash, 'card' => $card]);
    }

    /**
     * @param  array<string, mixed>  $item
     */
    private static function string(array $item, string $field, bool $allowEmpty = false): string
    {
        $value = $item[$field] ?? '';
        if (! is_string($value) || ! $allowEmpty && $value === '') {
            throw new UnexpectedValueException("{$field} missing");
        }

        return $value;
    }

    /**
     * @param  array<string, mixed>  $item
     */
    private static function date(array $item, string $field): Carbon
    {
        return Carbon::parse(self::string($item, $field))->utc();
    }
}
