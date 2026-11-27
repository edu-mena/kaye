<?php

namespace Tests\Feature;

use App\Enums\ContentStatus;
use App\Models\Area;
use App\Models\Career;
use App\Models\CareerGroup;
use App\Models\Company;
use App\Models\Course;
use App\Models\CourseOffer;
use App\Models\Dataset;
use App\Models\Institution;
use App\Models\News;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\File;
use Illuminate\Testing\TestResponse;
use Symfony\Component\HttpFoundation\Response;
use Tests\TestCase;

/**
 * What search engines get for each page (docs/seo.md): its own title, description, canonical address, structured
 * data and content, without running JavaScript; a missing row is a real 404; private pages are noindex.
 */
class SeoTest extends TestCase
{
    use RefreshDatabase;

    private const array PUBLISHED = ['status' => ContentStatus::Published];

    /**
     * The head of the built index.html, as Vite writes it: the server replaces these tags with each page's own.
     */
    private const string INDEX = <<<'HTML'
        <!doctype html>
        <html lang="pt">
          <head>
            <meta charset="UTF-8" />
            <meta
              name="description"
              content="A descrição de sempre."
            />
            <title>Kayé</title>
            <!-- Link preview (WhatsApp, Facebook, LinkedIn, X): crawlers need absolute URLs. -->
            <meta property="og:url" content="https://kaye-indol.vercel.app/" />
            <meta property="og:title" content="Kayé" />
            <meta name="twitter:card" content="summary_large_image" />
            <script type="module" crossorigin src="/spa/assets/index-abc.js"></script>
          </head>
          <body>
            <div id="root"></div>
          </body>
        </html>
        HTML;

    private string $index;

    private ?string $original;

    protected function setUp(): void
    {
        parent::setUp();
        config(['app.url' => 'https://kayeangola.com']);

        $this->index = public_path('spa/index.html');
        $this->original = is_file($this->index) ? File::get($this->index) : null;
        File::ensureDirectoryExists(dirname($this->index));
        File::put($this->index, self::INDEX);
    }

    protected function tearDown(): void
    {
        $this->original === null ? File::delete($this->index) : File::put($this->index, $this->original);

        parent::tearDown();
    }

    public function test_a_career_page_has_its_own_title_description_content_and_occupation_data(): void
    {
        $area = Area::factory()->create(['slug' => 'health', 'name' => ['pt' => 'Saúde']] + self::PUBLISHED);
        $group = CareerGroup::factory()->create(['area_id' => $area->id, 'name' => ['pt' => 'Medicina']] + self::PUBLISHED);
        $career = Career::factory()->create([
            'slug' => 'cardiopneumologista', 'career_group_id' => $group->id, 'salary_median' => 361910,
            'name' => ['pt' => 'Cardiopneumologista'], 'summary' => ['pt' => 'Faz os exames ao coração e aos pulmões.'],
            'description' => ['pt' => 'Faz electrocardiogramas e provas de esforço.'],
        ] + self::PUBLISHED);
        $institution = Institution::factory()->create(['slug' => 'uan', 'name' => 'Universidade Agostinho Neto'] + self::PUBLISHED);
        $offer = CourseOffer::factory()->create(['institution_id' => $institution->id, 'name' => ['pt' => 'Cardiopneumologia']] + self::PUBLISHED);
        $career->courseOffers()->attach($offer);

        $response = $this->get('/carreiras/cardiopneumologista')->assertOk();
        $html = (string) $response->getContent();

        $this->assertStringContainsString('<title>Cardiopneumologista: o que faz, salário e onde estudar em Angola | Kayé</title>', $html);
        $this->assertStringContainsString('<link rel="canonical" href="https://kayeangola.com/carreiras/cardiopneumologista" />', $html);
        $this->assertStringContainsString('Salário mediano em Angola: 361 910 Kz por mês.', $html);
        $this->assertStringContainsString('<h1 class="mt-4 text-2xl font-semibold">Cardiopneumologista</h1>', $html);
        $this->assertStringContainsString('href="/academias/uan">Cardiopneumologia — Universidade Agostinho Neto</a>', $html);
        // index.html's own tags are replaced, never doubled, and nothing points at the old Vercel site any more.
        $this->assertSame(1, substr_count($html, '<title>'));
        $this->assertSame(1, substr_count($html, 'name="description"'));
        $this->assertStringNotContainsString('vercel.app', $html);

        $occupation = $this->jsonLd($response, 'Occupation');
        $this->assertSame('Cardiopneumologista', $occupation['name']);
        $this->assertSame('AOA', data_get($occupation, 'estimatedSalary.0.currency'));
        $this->assertSame(361910, data_get($occupation, 'estimatedSalary.0.median'));
        $this->assertSame('Angola', data_get($occupation, 'occupationLocation.0.name'));
        $this->assertSame('Saúde', data_get($this->jsonLd($response, 'BreadcrumbList'), 'itemListElement.2.name'));
    }

    public function test_a_page_that_does_not_exist_or_is_a_draft_is_a_real_404_out_of_any_index(): void
    {
        Career::factory()->create(['slug' => 'rascunho']);

        foreach (['/carreiras/nao-existe', '/carreiras/rascunho', '/academias/nao-existe', '/cursos/curso/nao-existe', '/empresas/nao-existe', '/novidades/nao-existe'] as $path) {
            $html = (string) $this->get($path)->assertNotFound()->getContent();
            $this->assertStringContainsString('<meta name="robots" content="noindex, follow" />', $html, $path);
            $this->assertStringContainsString('<div id="root">', $html, "$path still serves the app");
        }
    }

    public function test_private_pages_are_never_indexed(): void
    {
        foreach (['/perfil', '/plano', '/entrar', '/c/joana', '/cv/editar', '/kursos/dados/1/2'] as $path) {
            $html = (string) $this->get($path)->assertOk()->getContent();
            $this->assertStringContainsString('content="noindex, follow"', $html, $path);
            $this->assertStringNotContainsString('rel="canonical"', $html, $path);
        }
    }

    public function test_the_home_ties_the_site_to_the_kaye_social_profiles(): void
    {
        $response = $this->get('/')->assertOk();
        // The brand once: "Kayé: …", never "Kayé: … | Kayé".
        $this->assertStringContainsString('<title>Kayé: carreiras, cursos, universidades, bolsas e emprego em Angola</title>', (string) $response->getContent());

        $organization = $this->jsonLd($response, 'Organization');
        $this->assertSame([
            'https://www.youtube.com/@KayeAngola',
            'https://www.tiktok.com/@kaye_angola',
            'https://www.facebook.com/profile.php?id=61596823982332',
        ], $organization['sameAs']);
        $this->assertSame('https://kayeangola.com/pesquisa?q={search_term_string}', data_get($this->jsonLd($response, 'WebSite'), 'potentialAction.target.urlTemplate'));
        $this->assertStringContainsString('<a href="https://www.tiktok.com/@kaye_angola" rel="me noopener">TikTok</a>', (string) $response->getContent());
    }

    public function test_institutions_courses_companies_and_news_get_their_structured_data(): void
    {
        $institution = Institution::factory()->create(['slug' => 'isptec', 'name' => 'ISPTEC', 'type' => 'instituto_superior', 'website' => 'https://isptec.co.ao'] + self::PUBLISHED);
        $course = Course::factory()->create(['slug' => 'engenharia-informatica', 'name' => ['pt' => 'Engenharia Informática']] + self::PUBLISHED);
        CourseOffer::factory()->create(['institution_id' => $institution->id, 'course_id' => $course->id, 'name' => ['pt' => 'Engenharia Informática']] + self::PUBLISHED);
        Company::factory()->create(['slug' => 'unitel', 'name' => 'Unitel', 'summary' => ['pt' => 'Telecomunicações.']] + self::PUBLISHED);
        News::factory()->create(['slug' => 'bolsas-2027', 'title' => ['pt' => 'Abrem as bolsas de 2027'], 'summary' => ['pt' => 'Candidaturas até março.'], 'date' => '2026-11-20'] + self::PUBLISHED);

        $college = $this->jsonLd($this->get('/academias/isptec')->assertOk(), 'CollegeOrUniversity');
        $this->assertSame('ISPTEC', $college['name']);
        $this->assertSame(['https://isptec.co.ao'], $college['sameAs']);
        $this->assertSame('Engenharia Informática', data_get($college, 'hasOfferCatalog.itemListElement.0.itemOffered.name'));

        $courseLd = $this->jsonLd($this->get('/cursos/curso/engenharia-informatica')->assertOk(), 'Course');
        $this->assertSame('ISPTEC', data_get($courseLd, 'provider.0.name'));

        $this->assertSame('Unitel', $this->jsonLd($this->get('/empresas/unitel')->assertOk(), 'Organization')['name']);

        $article = $this->jsonLd($this->get('/novidades/bolsas-2027')->assertOk(), 'NewsArticle');
        $this->assertSame('2026-11-20', $article['datePublished']);
    }

    public function test_the_market_page_publishes_its_statistics_as_datasets(): void
    {
        Dataset::factory()->create(['slug' => 'jobs', 'data' => ['postings' => 2474, 'from' => '2025-10-29', 'updated' => '2026-10-28', 'provinces' => [['province' => 'Luanda', 'postings' => 1792]]]] + self::PUBLISHED);
        Dataset::factory()->create(['slug' => 'employment', 'data' => ['year' => 2025, 'unemployment' => 0.283, 'youth' => ['unemployment' => 0.518], 'source' => ['label' => 'INE', 'url' => 'https://ine.gov.ao/emprego.pdf']]] + self::PUBLISHED);

        $response = $this->get('/mercado')->assertOk();
        $html = (string) $response->getContent();

        $this->assertStringContainsString('2 474', $html);
        $this->assertStringContainsString('28,3 %', $html);
        $this->assertStringContainsString('51,8 %', $html);
        $this->assertStringContainsString('Luanda', $html);
        $this->assertSame('https://ine.gov.ao/emprego.pdf', $this->jsonLd($response, 'Dataset', 1)['isBasedOn']);
    }

    public function test_text_from_the_catalogue_cannot_break_out_of_the_page(): void
    {
        Career::factory()->create([
            'slug' => 'perigo', 'name' => ['pt' => 'Perigo</script><script>alert(1)</script>'], 'summary' => ['pt' => '<img src=x onerror=alert(1)>'],
        ] + self::PUBLISHED);

        $html = (string) $this->get('/carreiras/perigo')->assertOk()->getContent();

        $this->assertStringNotContainsString('<script>alert(1)</script>', $html);
        $this->assertStringNotContainsString('<img src=x', $html);
        $this->assertStringContainsString('</script>', $html, 'The JSON-LD must escape "<".');
    }

    public function test_the_sitemap_lists_every_published_page_and_nothing_else(): void
    {
        Career::factory()->create(['slug' => 'enfermeiro'] + self::PUBLISHED);
        Career::factory()->create(['slug' => 'rascunho']);
        Institution::factory()->create(['slug' => 'uan'] + self::PUBLISHED);

        $response = $this->get('/sitemap.xml')->assertOk()->assertHeader('Content-Type', 'application/xml; charset=UTF-8');
        $xml = (string) $response->getContent();

        $this->assertStringStartsWith('<?xml version="1.0" encoding="UTF-8"?>', $xml);
        $this->assertNotFalse(simplexml_load_string($xml), 'The sitemap is not valid XML.');
        $this->assertStringContainsString('<loc>https://kayeangola.com/</loc>', $xml);
        $this->assertStringContainsString('<loc>https://kayeangola.com/carreiras/enfermeiro</loc>', $xml);
        $this->assertStringContainsString('<loc>https://kayeangola.com/academias/uan</loc>', $xml);
        $this->assertStringContainsString('<loc>https://kayeangola.com/mercado</loc>', $xml);
        $this->assertStringNotContainsString('rascunho', $xml);
        $this->assertStringNotContainsString('/perfil', $xml);
    }

    public function test_robots_txt_points_at_the_sitemap_and_leaves_the_api_open_for_rendering(): void
    {
        $robots = File::get(public_path('robots.txt'));

        $this->assertStringContainsString('Sitemap: https://kayeangola.com/sitemap.xml', $robots);
        $this->assertStringContainsString('Disallow: /admin', $robots);
        // The app reads its content from /api/v1: blocked, a search engine would render empty pages.
        $this->assertStringNotContainsString('Disallow: /api', $robots);
    }

    public function test_the_search_console_verification_file_stays_published(): void
    {
        // Google re-checks this file: removed, the site loses its Search Console verification (docs/seo.md).
        $this->assertSame(
            'google-site-verification: google968e73977fec3650.html',
            trim(File::get(public_path('google968e73977fec3650.html'))),
        );
    }

    /**
     * The structured data of a type in the page (the nth of that type).
     *
     * @param  TestResponse<Response>  $response
     * @return array<mixed>
     */
    private function jsonLd(TestResponse $response, string $type, int $nth = 0): array
    {
        preg_match_all('/<script type="application\/ld\+json">(.*?)<\/script>/s', (string) $response->getContent(), $matches);
        $found = [];
        foreach ($matches[1] as $json) {
            $data = json_decode($json, true, flags: JSON_THROW_ON_ERROR);
            if (is_array($data) && ($data['@type'] ?? null) === $type) {
                $found[] = $data;
            }
        }
        $this->assertArrayHasKey($nth, $found, "No {$type} in the page's structured data.");

        return $found[$nth];
    }
}
