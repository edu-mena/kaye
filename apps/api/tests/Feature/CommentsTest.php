<?php

namespace Tests\Feature;

use App\Enums\ContentStatus;
use App\Models\Comment;
use App\Models\News;
use App\Models\User;
use App\Support\CommentFilter;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\RateLimiter;
use Laravel\Sanctum\Sanctum;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

/**
 * Comments on news, companies and simulations: account needed to write, automatic filter, 3 reports hide, the
 * author deletes, minors show the first name only, nothing personal in the answer.
 */
class CommentsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        News::factory()->create(['slug' => 'bolsas-2026', 'status' => ContentStatus::Published]);
    }

    public function test_without_an_account_writing_reporting_and_deleting_answer_401(): void
    {
        $comment = Comment::factory()->create();

        $this->postJson('/api/v1/comments', $this->payload('Muito útil'))->assertUnauthorized();
        $this->postJson("/api/v1/comments/{$comment->id}/report")->assertUnauthorized();
        $this->deleteJson("/api/v1/comments/{$comment->id}")->assertUnauthorized();
        $this->getJson('/api/v1/me/comments')->assertUnauthorized();
        $this->assertSame(1, Comment::query()->count());
    }

    public function test_a_comment_is_published_and_listed_with_nothing_personal(): void
    {
        $user = User::factory()->create(['name' => 'Ana Maria Silva', 'email' => 'ana@example.com', 'birth_year' => 1995]);
        Sanctum::actingAs($user);

        $this->postJson('/api/v1/comments', $this->payload('Muito útil, obrigada!'))
            ->assertCreated()
            ->assertJsonPath('author', 'Ana Maria Silva');

        $list = $this->getJson('/api/v1/comments?type=news&id=bolsas-2026')->assertOk()->assertJsonCount(1);
        $first = $list->json('0');
        $this->assertIsArray($first);
        $this->assertSame(['id', 'type', 'subject', 'author', 'body', 'at'], array_keys($first));
        $this->assertStringNotContainsString('ana@example.com', $list->getContent() ?: '');
        $this->assertStringNotContainsString('1995', $list->getContent() ?: '');
    }

    public function test_a_minor_shows_only_the_first_name(): void
    {
        Sanctum::actingAs(User::factory()->minor()->create(['name' => 'Paulo Jorge Gomes']));

        $this->postJson('/api/v1/comments', $this->payload('Gostei'))->assertCreated()->assertJsonPath('author', 'Paulo');
        $this->getJson('/api/v1/comments?type=news&id=bolsas-2026')->assertJsonPath('0.author', 'Paulo');
    }

    /**
     * @return array<string, array{string, string}>
     */
    public static function refusedTexts(): array
    {
        return [
            'phone' => ['Liga para 923 456 789 já', 'phone'],
            'spread phone' => ['9 2 3-4 5 6.7 8 9', 'phone'],
            'email' => ['escreve para ana@example.com', 'email'],
            'link' => ['vê em https://exemplo.com/oferta', 'link'],
            'bare domain' => ['aqui: bolsas.co.ao', 'link'],
            'swearing' => ['isto é uma merda', 'swearing'],
            'disguised swearing' => ['p0rr4 de site', 'swearing'],
            'stretched swearing' => ['puuuuta que pariu', 'swearing'],
            'too long' => [str_repeat('a', 501), 'too_long'],
        ];
    }

    #[DataProvider('refusedTexts')]
    public function test_the_filter_refuses_swearing_phones_emails_and_links(string $text, string $reason): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/v1/comments', $this->payload($text))
            ->assertUnprocessable()->assertJsonPath('error', 'refused')->assertJsonPath('reason', $reason);
        $this->assertSame(0, Comment::query()->count());
    }

    public function test_an_empty_comment_is_invalid(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/v1/comments', $this->payload('   '))->assertUnprocessable();
        $this->assertSame('empty', CommentFilter::refusal('   '));
    }

    public function test_the_filter_accepts_normal_text_with_a_few_numbers(): void
    {
        $this->assertNull(CommentFilter::refusal('São 50 vagas, abertas até 30 de Novembro de 2026. Muito bom!'));
        $this->assertNull(CommentFilter::refusal('A Maria disse que a cultura é boa'));
    }

    public function test_a_subject_that_does_not_exist_is_refused(): void
    {
        Sanctum::actingAs(User::factory()->create());
        News::factory()->create(['slug' => 'rascunho']);

        $this->postJson('/api/v1/comments', ['type' => 'news', 'id' => 'rascunho', 'body' => 'olá'])->assertUnprocessable();
        $this->postJson('/api/v1/comments', ['type' => 'company', 'id' => 'nao-existe', 'body' => 'olá'])->assertUnprocessable();
        $this->postJson('/api/v1/comments', ['type' => 'other', 'id' => 'x', 'body' => 'olá'])->assertUnprocessable();
        $this->postJson('/api/v1/comments', ['type' => 'simulation', 'id' => 'exame-matematica', 'body' => 'Difícil'])->assertCreated();
    }

    public function test_three_reports_hide_a_comment_and_one_person_counts_once(): void
    {
        $comment = Comment::factory()->create(['subject_id' => 'bolsas-2026']);

        $first = User::factory()->create();
        Sanctum::actingAs($first);
        $this->postJson("/api/v1/comments/{$comment->id}/report")->assertOk();
        $this->postJson("/api/v1/comments/{$comment->id}/report")->assertOk();
        $this->assertSame(1, $comment->refresh()->reports_count);

        Sanctum::actingAs(User::factory()->create());
        $this->postJson("/api/v1/comments/{$comment->id}/report")->assertOk();
        $this->assertNull($comment->refresh()->hidden_at);
        $this->getJson('/api/v1/comments?type=news&id=bolsas-2026')->assertJsonCount(1);

        Sanctum::actingAs(User::factory()->create());
        $this->postJson("/api/v1/comments/{$comment->id}/report")->assertOk();

        $this->assertNotNull($comment->refresh()->hidden_at);
        $this->getJson('/api/v1/comments?type=news&id=bolsas-2026')->assertJsonCount(0);
    }

    public function test_the_author_cannot_report_their_own_comment(): void
    {
        $author = User::factory()->create();
        $comment = Comment::factory()->create(['user_id' => $author->id]);
        Sanctum::actingAs($author);

        $this->postJson("/api/v1/comments/{$comment->id}/report")->assertOk();

        $this->assertSame(0, $comment->refresh()->reports_count);
    }

    public function test_only_the_author_deletes_a_comment(): void
    {
        $author = User::factory()->create();
        $comment = Comment::factory()->create(['user_id' => $author->id]);

        Sanctum::actingAs(User::factory()->create());
        $this->deleteJson("/api/v1/comments/{$comment->id}")->assertForbidden();
        $this->assertSame(1, Comment::query()->count());

        Sanctum::actingAs($author);
        $this->getJson('/api/v1/me/comments')->assertExactJson([$comment->id]);
        $this->deleteJson("/api/v1/comments/{$comment->id}")->assertNoContent();
        $this->assertSame(0, Comment::query()->count());
    }

    public function test_writing_is_limited_to_20_an_hour_per_account(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);
        RateLimiter::clear('comments:'.$user->id);

        for ($i = 0; $i < 20; $i++) {
            $this->postJson('/api/v1/comments', $this->payload("Comentário número {$i}"))->assertCreated();
        }

        $this->postJson('/api/v1/comments', $this->payload('Mais um'))->assertTooManyRequests()->assertJsonPath('error', 'too_many');
    }

    /**
     * @return array<string, string>
     */
    private function payload(string $body): array
    {
        return ['type' => 'news', 'id' => 'bolsas-2026', 'body' => $body];
    }
}
