<?php

namespace Tests\Feature;

use App\Enums\ContentStatus;
use App\Models\Area;
use App\Models\Career;
use App\Models\Company;
use App\Models\Institution;
use App\Models\News;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

/**
 * `kaye:fetch-news`: the feeds of config/news.php become news about training, work and careers, linked to areas,
 * companies and institutions, without duplicates, and a source that fails does not stop the others.
 */
class NewsCollectionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config([
            'news.pause_seconds' => 0,
            'news.sources' => [
                ['id' => 'a', 'name' => 'Jornal A', 'type' => 'rss', 'url' => 'https://a.test/feed'],
                ['id' => 'b', 'name' => 'Jornal B', 'type' => 'sitemap', 'url' => 'https://b.test/news.xml'],
            ],
        ]);
    }

    public function test_a_relevant_item_becomes_news_linked_to_what_it_is_about(): void
    {
        $company = Company::factory()->create(['name' => 'Sonangol', 'status' => ContentStatus::Published]);
        $institution = Institution::factory()->create(['name' => 'ISPTEC', 'status' => ContentStatus::Published]);
        $area = Area::factory()->create(['slug' => 'oil_mining', 'status' => ContentStatus::Published]);
        Http::fake(['a.test/*' => Http::response($this->rss([
            ['Sonangol abre bolsas de estudo no ISPTEC', 'https://a.test/p/1', $this->today(), 'A petrolífera abre 50 bolsas. O resto do artigo não vem.', 'https://a.test/img.jpg'],
        ])), 'b.test/*' => Http::response('', 500)]);

        $this->assertSame(0, Artisan::call('kaye:fetch-news'));

        $news = News::query()->sole();
        $this->assertSame('empresas', $news->kind);
        $this->assertSame(ContentStatus::Published, $news->status);
        $this->assertSame('Sonangol abre bolsas de estudo no ISPTEC', $news->getTranslation('title', 'pt'));
        $this->assertSame('A petrolífera abre 50 bolsas.', $news->getTranslation('summary', 'pt'));
        $this->assertSame(['label' => 'Jornal A', 'url' => 'https://a.test/p/1'], $news->source);
        $this->assertIsArray($news->image);
        $this->assertSame('https://a.test/img.jpg', $news->image['thumb']);
        $this->assertSame([$company->id], $news->companies()->pluck('companies.id')->all());
        $this->assertSame([$institution->id], $news->institutions()->pluck('institutions.id')->all());
        $this->assertSame([$area->id], $news->areas()->pluck('areas.id')->all());
    }

    public function test_the_same_piece_is_not_saved_twice_by_link_or_by_title(): void
    {
        Http::fake(['a.test/*' => Http::sequence()
            ->push($this->rss([['Concurso público para professores', 'https://www.a.test/p/1/?utm=x', $this->today(), '', null]]))
            ->push($this->rss([['Concurso público para professores', 'http://a.test/p/1', $this->today(), '', null]]))
            ->push($this->rss([['Concurso   público para PROFESSORES!', 'https://a.test/outro-link', $this->today(), '', null]])),
            'b.test/*' => Http::response('', 500)]);

        Artisan::call('kaye:fetch-news');
        Artisan::call('kaye:fetch-news');
        Artisan::call('kaye:fetch-news');

        $this->assertSame(1, News::query()->count());
    }

    public function test_news_with_nothing_to_do_with_training_work_or_careers_stays_out(): void
    {
        Http::fake(['a.test/*' => Http::response($this->rss([
            ['Benfica vence o Petro de Luanda por dois golos', 'https://a.test/p/2', $this->today(), 'Jogo emocionante.', null],
        ])), 'b.test/*' => Http::response('', 500)]);

        Artisan::call('kaye:fetch-news');

        $this->assertSame(0, News::query()->count());
    }

    public function test_a_career_name_is_enough_and_brings_its_area(): void
    {
        $area = Area::factory()->create(['slug' => 'health', 'status' => ContentStatus::Published]);
        $group = \App\Models\CareerGroup::factory()->create(['area_id' => $area->id]);
        $career = Career::factory()->create(['career_group_id' => $group->id, 'name' => ['pt' => 'Enfermeiro'], 'status' => ContentStatus::Published]);
        Http::fake(['a.test/*' => Http::response($this->rss([
            ['Enfermeiro angolano premiado em Lisboa', 'https://a.test/p/3', $this->today(), '', null],
        ])), 'b.test/*' => Http::response('', 500)]);

        Artisan::call('kaye:fetch-news');

        $news = News::query()->sole();
        $this->assertSame([$career->id], $news->careers()->pluck('careers.id')->all());
        $this->assertSame([$area->id], $news->areas()->pluck('areas.id')->all());
    }

    public function test_a_source_that_fails_does_not_stop_the_others(): void
    {
        Http::fake([
            'a.test/*' => fn () => throw new ConnectionException('timeout'),
            'b.test/*' => Http::response($this->sitemap([['Abertas 200 vagas de emprego para jovens', 'https://b.test/n/1', $this->today()]])),
        ]);

        $this->assertSame(0, Artisan::call('kaye:fetch-news'));

        $news = News::query()->sole();
        $this->assertSame('Notícia publicada por Jornal B.', $news->getTranslation('summary', 'pt'));
        $this->assertNull($news->image);
    }

    public function test_old_future_and_garbled_items_are_ignored_and_a_run_has_a_limit(): void
    {
        config(['news.max_new_per_run' => 2]);
        Http::fake(['a.test/*' => Http::response($this->rss([
            ['Bolsas de estudo antigas', 'https://a.test/old', now()->subDays(90)->toRfc2822String(), '', null],
            ['Bolsas de estudo do futuro', 'https://a.test/future', now()->addDays(10)->toRfc2822String(), '', null],
            ['Bolsas de estudo 1', 'https://a.test/1', $this->today(), '', null],
            ['Bolsas de estudo 2', 'https://a.test/2', $this->today(), '', null],
            ['Bolsas de estudo 3', 'https://a.test/3', $this->today(), '', null],
        ])), 'b.test/*' => Http::response('not xml at all', 200)]);

        $this->assertSame(0, Artisan::call('kaye:fetch-news'));

        $this->assertSame(2, News::query()->count());
    }

    public function test_the_news_api_shows_the_links_and_the_newest_first(): void
    {
        $area = Area::factory()->create(['slug' => 'education', 'status' => ContentStatus::Published]);
        Http::fake(['a.test/*' => Http::response($this->rss([
            ['Professores: concurso público abre', 'https://a.test/p/9', $this->today(), '', null],
        ])), 'b.test/*' => Http::response('', 500)]);
        Artisan::call('kaye:fetch-news');

        $this->getJson('/api/v1/news')->assertOk()
            ->assertJsonPath('0.kind', 'cursos')
            ->assertJsonPath('0.areas', [$area->slug])
            ->assertJsonPath('0.source.label', 'Jornal A');
    }

    private function today(): string
    {
        return now()->toRfc2822String();
    }

    /**
     * @param  list<array{0: string, 1: string, 2: string, 3: string, 4: ?string}>  $items
     */
    private function rss(array $items): string
    {
        $xml = '<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/"><channel>';
        foreach ($items as [$title, $link, $date, $lead, $image]) {
            $xml .= "<item><title><![CDATA[{$title}]]></title><link>{$link}</link><pubDate>{$date}</pubDate>"
                ."<description><![CDATA[<p>{$lead}</p>]]></description>"
                .($image === null ? '' : "<media:thumbnail url=\"{$image}\"/>").'</item>';
        }

        return $xml.'</channel></rss>';
    }

    /**
     * @param  list<array{0: string, 1: string, 2: string}>  $items
     */
    private function sitemap(array $items): string
    {
        $xml = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">';
        foreach ($items as [$title, $link, $date]) {
            $day = date('c', (int) strtotime($date));
            $xml .= "<url><loc>{$link}</loc><news:news><news:publication_date>{$day}</news:publication_date><news:title>{$title}</news:title></news:news></url>";
        }

        return $xml.'</urlset>';
    }
}
