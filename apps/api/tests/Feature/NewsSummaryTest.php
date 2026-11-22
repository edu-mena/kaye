<?php

namespace Tests\Feature;

use App\Models\News;
use App\Support\NewsSummariser;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

/**
 * The summary of each collected piece: written by the Claude API from the article's paragraphs, kept instead of
 * the article, and never blocking the collection when anything fails.
 */
class NewsSummaryTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['news.pause_seconds' => 0, 'news.sources' => [], 'news.ai.key' => 'test-key']);
    }

    public function test_a_piece_gets_the_summary_and_the_facts_that_matter(): void
    {
        $news = $this->collected();
        Http::fake([
            'a.test/*' => Http::response($this->page()),
            'api.anthropic.com/*' => Http::response($this->answer('{"summary": "A Unitel lança uma OPA ao BFA.", "body": ["A Unitel vai comprar as acções do BFA.", "O prazo termina em Dezembro."]}')),
        ]);

        $this->assertSame(0, Artisan::call('kaye:fetch-news'));

        $news->refresh();
        $this->assertSame('A Unitel lança uma OPA ao BFA.', $news->getTranslation('summary', 'pt'));
        $this->assertSame(['A Unitel vai comprar as acções do BFA.', 'O prazo termina em Dezembro.'], $news->getTranslation('body', 'pt'));
        $this->assertSame(1, $news->summary_attempts);
        Http::assertSent(fn (Request $request): bool => $request->hasHeader('x-api-key', 'test-key')
            && str_contains($request->body(), 'Exercer direito')
            && str_contains($request->body(), 'O texto do artigo')
            && ! str_contains($request->body(), 'Menu do site'));
    }

    public function test_without_a_key_nothing_is_read_or_sent(): void
    {
        config(['news.ai.key' => '']);
        $news = $this->collected();
        Http::fake();

        $this->assertSame(0, Artisan::call('kaye:fetch-news'));

        Http::assertNothingSent();
        $this->assertNull($news->refresh()->getRawOriginal('body'));
        $this->assertSame(0, $news->summary_attempts);
    }

    public function test_a_bad_answer_a_refusal_or_a_dead_page_keep_the_old_summary_and_count_the_attempt(): void
    {
        $news = $this->collected();
        $answers = [
            ['a.test/*' => Http::response($this->page()), 'api.anthropic.com/*' => Http::response($this->answer('não sei'))],
            ['a.test/*' => Http::response($this->page()), 'api.anthropic.com/*' => Http::response('', 529)],
            ['a.test/*' => Http::response('', 404)],
            ['a.test/*' => Http::response('<p>Muito curto.</p>')],
            ['a.test/*' => fn () => throw new ConnectionException('timeout')],
        ];

        foreach ($answers as $fake) {
            config(['news.ai.max_attempts' => 99]);
            Http::fake($fake);
            $this->assertSame(0, Artisan::call('kaye:fetch-news'));
        }

        $news->refresh();
        $this->assertSame('Resumo do feed.', $news->getTranslation('summary', 'pt'));
        $this->assertNull($news->getRawOriginal('body'));
        $this->assertSame(5, $news->summary_attempts);
    }

    public function test_a_piece_is_given_up_after_the_maximum_attempts(): void
    {
        $news = $this->collected();
        Http::fake(['a.test/*' => Http::response('', 404)]);

        foreach (range(1, 5) as $ignored) {
            Artisan::call('kaye:fetch-news');
        }

        $this->assertSame(3, $news->refresh()->summary_attempts);
    }

    public function test_only_collected_pieces_without_a_body_are_summarised_and_only_a_few_per_run(): void
    {
        config(['news.ai.max_per_run' => 2]);
        News::factory()->create(['slug' => 'editorial', 'source_url' => 'https://a.test/editorial']);
        News::factory()->create(['slug' => 'done', 'source_url' => 'https://a.test/done', 'url_hash' => hash('sha256', 'done'), 'body' => ['pt' => ['Já tem.']]]);
        foreach (range(1, 4) as $number) {
            $this->collected("piece-{$number}");
        }
        Http::fake([
            'a.test/*' => Http::response($this->page()),
            'api.anthropic.com/*' => Http::response($this->answer('{"summary": "Resumo.", "body": ["Um parágrafo."]}')),
        ]);

        $this->assertSame(0, Artisan::call('kaye:fetch-news'));

        $this->assertSame(2, News::query()->whereNull('body')->where('summary_attempts', 0)->whereNotNull('url_hash')->count());
        $this->assertSame(['Já tem.'], News::query()->where('slug', 'done')->sole()->getTranslation('body', 'pt'));
        $this->assertNull(News::query()->where('slug', 'editorial')->sole()->getRawOriginal('body'));
    }

    public function test_an_answer_must_have_a_short_summary_and_a_few_clean_paragraphs(): void
    {
        $this->assertNull(NewsSummariser::parse(null));
        $this->assertNull(NewsSummariser::parse('{"summary": null}'));
        $this->assertNull(NewsSummariser::parse('{"summary": "x", "body": []}'));
        $this->assertNull(NewsSummariser::parse('{"summary": "'.str_repeat('a', 301).'", "body": ["x"]}'));
        $this->assertNull(NewsSummariser::parse('{"summary": "x", "body": ["'.str_repeat('a', 701).'"]}'));
        $this->assertNull(NewsSummariser::parse('{"summary": "x", "body": ["1","2","3","4","5","6"]}'));
        $this->assertSame(
            ['summary' => 'Resumo.', 'body' => ['Um.', 'Dois.']],
            NewsSummariser::parse("Aqui está:\n```json\n{\"summary\": \" Resumo. \", \"body\": [\"Um.\", 7, \"\", \"Dois.\"]}\n```"),
        );
    }

    public function test_only_the_paragraphs_of_the_article_are_read(): void
    {
        $text = NewsSummariser::paragraphs($this->page());

        $this->assertStringContainsString('O texto do artigo', $text);
        $this->assertStringNotContainsString('Menu do site', $text);
        $this->assertStringNotContainsString('alert(', $text);
        $this->assertStringNotContainsString('Curto', $text);
    }

    private function collected(string $slug = 'piece'): News
    {
        return News::factory()->create([
            'slug' => $slug,
            'title' => ['pt' => 'Exercer direito de preferência obriga Unitel a lançar uma OPA ao BFA'],
            'summary' => ['pt' => 'Resumo do feed.'],
            'source_url' => 'https://a.test/'.$slug,
            'url_hash' => hash('sha256', $slug),
        ]);
    }

    private function page(): string
    {
        $article = str_repeat('O texto do artigo traz os dados importantes da operação. ', 8);

        return '<html><body><nav><p>Menu do site com muitas ligações para outras secções do jornal.</p></nav>'
            ."<script>alert('x')</script><article><p>{$article}</p><p>Curto</p></article></body></html>";
    }

    /**
     * @return array<string, mixed>
     */
    private function answer(string $text): array
    {
        return ['content' => [['type' => 'text', 'text' => $text]]];
    }
}
