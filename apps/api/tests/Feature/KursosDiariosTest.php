<?php

namespace Tests\Feature;

use App\Filament\Resources\KursoQuestionStats\Pages\ListKursoQuestionStats;
use App\Models\Kurso;
use App\Models\KursoCompletion;
use App\Models\KursoQuestionStat;
use App\Models\KursoUnit;
use App\Models\User;
use App\Support\Accounts;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Illuminate\Testing\TestResponse;
use Laravel\Sanctum\Sanctum;
use Livewire\Livewire;
use Tests\TestCase;

/**
 * ADR 0025: one topic a day without Plus (enforced on the server), the certificate only for adults with Plus,
 * and anonymous per-question counters.
 */
class KursosDiariosTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $kurso = Kurso::factory()->create(['slug' => 'contabilidade', 'status' => 'published']);
        foreach (['t1', 't2'] as $slug) {
            KursoUnit::factory()->create(['kurso_id' => $kurso->id, 'slug' => $slug, 'status' => 'published']);
        }
    }

    /** @return TestResponse<\Illuminate\Http\JsonResponse> */
    private function complete(string $topic, ?string $day = null, ?float $score = null): TestResponse
    {
        return $this->postJson("/api/v1/kursos/contabilidade/topics/{$topic}/complete", ['day' => $day ?? now()->toDateString(), 'score' => $score]);
    }

    public function test_a_second_topic_on_the_same_day_is_refused_for_a_free_account(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->complete('t1')->assertOk();
        $this->complete('t1')->assertOk();
        $this->complete('t2')->assertStatus(409)
            ->assertJsonPath('code', 'daily_limit')
            ->assertJsonPath('opensOn', now()->addDay()->toDateString());
        $this->getJson('/api/v1/kursos/progress')->assertOk()->assertJsonCount(1, 'completions');
    }

    public function test_a_minor_follows_the_same_limit_even_with_plus(): void
    {
        Sanctum::actingAs(User::factory()->minor()->create(['plus_until' => now()->addMonth()]));

        $this->complete('t1')->assertOk();
        $this->complete('t2')->assertStatus(409);
    }

    public function test_plus_has_no_daily_limit(): void
    {
        Sanctum::actingAs(User::factory()->create(['plus_until' => now()->addMonth()]));

        $this->complete('t1')->assertOk();
        $this->complete('t2')->assertOk();
    }

    public function test_without_a_session_it_is_401_and_a_wild_day_is_422(): void
    {
        $this->complete('t1')->assertUnauthorized();

        Sanctum::actingAs(User::factory()->create());
        $this->complete('t1', now()->addDays(5)->toDateString())->assertUnprocessable();
        $this->complete('nope')->assertNotFound();
    }

    public function test_the_certificate_needs_plus_an_adult_and_a_passed_exam(): void
    {
        Sanctum::actingAs(User::factory()->create());
        $this->getJson('/api/v1/kursos/contabilidade/certificate')->assertForbidden();

        Sanctum::actingAs(User::factory()->minor()->create(['plus_until' => now()->addMonth()]));
        $this->getJson('/api/v1/kursos/contabilidade/certificate')->assertForbidden();

        $plus = User::factory()->create(['plus_until' => now()->addMonth()]);
        Sanctum::actingAs($plus);
        $this->getJson('/api/v1/kursos/contabilidade/certificate')->assertStatus(409)->assertJsonPath('code', 'exam_not_passed');
        $this->complete('exam', score: 0.5)->assertUnprocessable();
        $this->complete('exam', score: 0.8)->assertOk();
        $this->getJson('/api/v1/kursos/contabilidade/certificate')->assertOk()
            ->assertJsonPath('name', $plus->name)->assertJsonStructure(['name', 'course', 'date', 'code']);
    }

    public function test_the_answer_statistics_keep_no_trace_of_the_person(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/v1/kursos/contabilidade/answers', ['question_id' => 'q1', 'correct' => false])->assertNoContent();
        $this->postJson('/api/v1/kursos/contabilidade/answers', ['question_id' => 'q1', 'correct' => true])->assertNoContent();

        $stat = KursoQuestionStat::query()->sole();
        $this->assertSame([2, 1], [$stat->answered, $stat->correct]);
        $this->assertSame(['id', 'course', 'question_id', 'answered', 'correct'], Schema::getColumnListing('kurso_question_stats'));
    }

    public function test_erasing_the_data_removes_the_completions_but_not_the_counters(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);
        $this->complete('t1')->assertOk();
        $this->postJson('/api/v1/kursos/contabilidade/answers', ['question_id' => 'q1', 'correct' => true]);

        app(Accounts::class)->delete($user);

        $this->assertSame(0, KursoCompletion::query()->count());
        $this->assertSame(1, KursoQuestionStat::query()->count());
    }

    public function test_the_failed_questions_page_needs_20_answers_and_sorts_by_error_rate(): void
    {
        config(['kaye.admin_emails' => ['boss@kaye.test']]);
        $this->actingAs(User::factory()->admin()->create(['email' => 'boss@kaye.test']));
        $hard = KursoQuestionStat::query()->create(['course' => 'c', 'question_id' => 'hard', 'answered' => 20, 'correct' => 4]);
        $easy = KursoQuestionStat::query()->create(['course' => 'c', 'question_id' => 'easy', 'answered' => 50, 'correct' => 45]);
        $few = KursoQuestionStat::query()->create(['course' => 'c', 'question_id' => 'few', 'answered' => 19, 'correct' => 0]);

        Livewire::test(ListKursoQuestionStats::class)
            ->assertCanSeeTableRecords([$hard, $easy], inOrder: true)
            ->assertCanNotSeeTableRecords([$few]);
    }
}
