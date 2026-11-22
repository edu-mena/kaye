<?php

namespace Tests\Feature;

use App\Models\JobPosting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * POST /ingest/jobs: the scrapers' job facts, with INGEST_TOKEN.
 */
class IngestJobsTest extends TestCase
{
    use RefreshDatabase;

    private const TOKEN = 'an-ingest-token-123456';

    protected function setUp(): void
    {
        parent::setUp();
        config(['kaye.ingest_token' => self::TOKEN]);
    }

    public function test_without_the_token_or_with_a_wrong_one_it_answers_401(): void
    {
        $this->postJson('/api/v1/ingest/jobs', ['jobs' => [$this->job()]])->assertUnauthorized();
        $this->postJson('/api/v1/ingest/jobs', ['jobs' => [$this->job()]], ['Authorization' => 'Bearer wrong-token-wrong-token'])->assertUnauthorized();
        $this->assertSame(0, JobPosting::query()->count());
    }

    public function test_a_short_or_missing_secret_locks_the_route(): void
    {
        config(['kaye.ingest_token' => 'short']);

        $this->postJson('/api/v1/ingest/jobs', ['jobs' => [$this->job()]], ['Authorization' => 'Bearer short'])->assertUnauthorized();
    }

    public function test_facts_are_saved_and_known_posts_updated_not_duplicated(): void
    {
        $headers = ['Authorization' => 'Bearer '.self::TOKEN];

        $this->postJson('/api/v1/ingest/jobs', ['jobs' => [$this->job(), $this->job(['id' => 'angovagas:2'])]], $headers)
            ->assertOk()->assertExactJson(['saved' => 2, 'rejected' => 0]);
        $this->postJson('/api/v1/ingest/jobs', ['jobs' => [$this->job(['title' => 'Novo título'])]], $headers)->assertOk();

        $this->assertSame(2, JobPosting::query()->count());
        $this->assertSame('Novo título', JobPosting::query()->where('external_id', 'angovagas:1')->value('title'));
    }

    public function test_bad_rows_are_counted_and_dropped_and_a_bad_body_is_refused(): void
    {
        $headers = ['X-Ingest-Token' => self::TOKEN];

        $this->postJson('/api/v1/ingest/jobs', ['jobs' => [
            $this->job(['url' => 'javascript:alert(1)']),
            $this->job(['id' => 'x:3', 'date' => '2026-02-30']),
            $this->job(['id' => 'x:4', 'title' => '']),
            'not a row',
            $this->job(['id' => 'x:5']),
        ]], $headers)->assertOk()->assertExactJson(['saved' => 1, 'rejected' => 4]);

        $this->postJson('/api/v1/ingest/jobs', ['jobs' => 'x'], $headers)->assertUnprocessable();
        $this->postJson('/api/v1/ingest/jobs', ['jobs' => array_fill(0, 501, $this->job())], $headers)->assertUnprocessable();
    }

    /**
     * @param  array<string, mixed>  $over
     * @return array<string, mixed>
     */
    private function job(array $over = []): array
    {
        return $over + [
            'id' => 'angovagas:1', 'source' => 'angovagas', 'date' => '2026-11-20', 'url' => 'https://angovagas.net/p/1',
            'title' => 'Técnico de Informática', 'kind' => 'vaga', 'company' => 'BAI', 'province' => 'Luanda', 'sector' => 'banking',
            'career' => null, 'openings' => 2,
        ];
    }
}
