<?php

namespace Tests\Feature;

use App\Models\JobPosting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

/**
 * GET /market/week: the last 7 days of job posts, counted live from job_postings (WeeklyJobs).
 */
class MarketWeekTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // 27/11/2026 at noon in Luanda: the week is 21–27/11, the one before 14–20/11.
        $this->travelTo(Carbon::parse('2026-11-27 11:00:00', 'UTC'));
    }

    public function test_it_counts_the_last_7_days_against_the_7_before_and_leaves_the_rest_out(): void
    {
        $this->posting('2026-11-27');
        $this->posting('2026-11-21');
        $this->posting('2026-11-20');
        $this->posting('2026-11-14');
        $this->posting('2026-11-13'); // older than both weeks
        $this->posting('2026-11-28'); // a board's date in the future

        $this->getJson('/api/v1/market/week')
            ->assertOk()
            ->assertJson(['from' => '2026-11-21', 'to' => '2026-11-27', 'postings' => 2, 'previous' => 2]);
    }

    public function test_the_same_post_on_two_sites_counts_once_but_unnamed_employers_are_never_merged(): void
    {
        $this->posting('2026-11-25', ['source' => 'angovagas', 'title' => 'Contabilista Sénior', 'company' => 'UNITEL S.A.']);
        $this->posting('2026-11-26', ['source' => 'jobartis', 'title' => 'contabilista senior', 'company' => 'Unitel']);
        $this->posting('2026-11-25', ['title' => 'Motorista']);
        $this->posting('2026-11-25', ['title' => 'Motorista']);
        $this->posting('2026-11-25', ['title' => 'Motorista', 'company' => 'Empresa do sector petrolífero']);

        $this->getJson('/api/v1/market/week')
            ->assertOk()
            ->assertJsonPath('postings', 4)
            ->assertJsonCount(1, 'companies')
            ->assertJsonPath('companies.0.postings', 1);
    }

    public function test_employers_are_ranked_under_one_name_and_agencies_counted_apart(): void
    {
        foreach (['Analista', 'Técnico', 'Engenheiro'] as $title) {
            $this->posting('2026-11-24', ['title' => $title, 'company' => 'Sonangol S.A.']);
        }
        $this->posting('2026-11-24', ['title' => 'Gestor', 'company' => 'SONANGOL - Distribuição']);
        $this->posting('2026-11-24', ['title' => 'Caixa', 'company' => 'BAI']);
        $this->posting('2026-11-24', ['title' => 'Vendedor', 'company' => 'Kept People Recruitment']);
        $this->posting('2026-11-24', ['title' => 'Operador', 'company' => 'Ascending Outsourcing']);

        $this->getJson('/api/v1/market/week')
            ->assertOk()
            ->assertJsonPath('postings', 7)
            ->assertJsonPath('companies', [
                ['name' => 'Sonangol', 'postings' => 4],
                ['name' => 'BAI', 'postings' => 1],
            ])
            ->assertJsonPath('agencies.postings', 2)
            ->assertJsonPath('agencies.names', ['Ascending Outsourcing', 'Kept People Recruitment']);
    }

    public function test_only_the_top_employers_are_listed(): void
    {
        foreach (range(1, 8) as $index) {
            $this->posting('2026-11-23', ['title' => 'Vaga', 'company' => "Empregador {$index}"]);
        }

        $this->getJson('/api/v1/market/week')->assertOk()->assertJsonCount(6, 'companies');
    }

    public function test_the_day_is_luandas_not_utcs(): void
    {
        // 23:30 UTC on the 27th is already the 28th in Luanda (UTC+1).
        $this->travelTo(Carbon::parse('2026-11-27 23:30:00', 'UTC'));
        $this->posting('2026-11-28');

        $this->getJson('/api/v1/market/week')
            ->assertOk()
            ->assertJson(['from' => '2026-11-22', 'to' => '2026-11-28', 'postings' => 1]);
    }

    public function test_without_posts_it_answers_zeros_and_no_update_time(): void
    {
        $this->getJson('/api/v1/market/week')
            ->assertOk()
            ->assertExactJson([
                'from' => '2026-11-21',
                'to' => '2026-11-27',
                'postings' => 0,
                'previous' => 0,
                'companies' => [],
                'agencies' => ['postings' => 0, 'names' => []],
                'updated' => null,
            ]);
    }

    public function test_it_says_when_the_facts_last_arrived_and_never_sends_a_post(): void
    {
        $this->posting('2026-11-27', ['title' => 'Contabilista', 'company' => 'BAI', 'url' => 'https://example.ao/vaga/1']);

        $response = $this->getJson('/api/v1/market/week')->assertOk()->assertJsonPath('updated', '2026-11-27T11:00:00Z');

        $this->assertStringNotContainsString('Contabilista', (string) $response->getContent());
        $this->assertStringNotContainsString('example.ao', (string) $response->getContent());
    }

    /**
     * @param  array<string, mixed>  $facts
     */
    private function posting(string $date, array $facts = []): void
    {
        JobPosting::factory()->create(['date' => $date, 'company' => null, ...$facts]);
    }
}
