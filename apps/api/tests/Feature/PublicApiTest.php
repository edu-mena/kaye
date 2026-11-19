<?php

namespace Tests\Feature;

use App\Enums\ContentStatus;
use App\Models\Area;
use App\Models\Career;
use App\Models\Course;
use App\Models\CourseOffer;
use App\Models\Dataset;
use App\Models\Figure;
use App\Models\FreeCourse;
use App\Models\Institution;
use App\Models\Kurso;
use App\Models\KursoUnit;
use App\Models\Mentor;
use App\Models\Program;
use App\Models\Testimonial;
use App\Models\VideoStory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/**
 * The public reads of /api/v1 (docs/arquitetura.md, section 6): only published content, by position, in the
 * language asked for; answers cached with an ETag and forgotten when the content changes. The parity with the
 * export is ApiParityTest.
 */
class PublicApiTest extends TestCase
{
    use RefreshDatabase;

    private const PUBLISHED = ['status' => ContentStatus::Published];

    public function test_a_list_has_only_the_published_rows_in_their_position(): void
    {
        $second = Career::factory()->create(['slug' => 'segunda', 'position' => 2] + self::PUBLISHED);
        $first = Career::factory()->create(['slug' => 'primeira', 'position' => 1] + self::PUBLISHED);
        Career::factory()->create(['slug' => 'rascunho', 'position' => 0]);
        Career::factory()->create(['slug' => 'em-revisao', 'status' => ContentStatus::Review]);

        $this->getJson('/api/v1/occupations')
            ->assertOk()
            ->assertJsonCount(2)
            ->assertJsonPath('0.slug', $first->slug)
            ->assertJsonPath('1.slug', $second->slug)
            ->assertJsonPath('0.group', $first->group?->slug);
    }

    public function test_a_detail_that_is_a_draft_has_no_guide_or_does_not_exist_answers_404(): void
    {
        Career::factory()->create(['slug' => 'publicada', 'detailed' => true] + self::PUBLISHED);
        Career::factory()->create(['slug' => 'rascunho', 'detailed' => true]);
        Career::factory()->create(['slug' => 'sem-guia', 'detailed' => false] + self::PUBLISHED);

        $this->getJson('/api/v1/occupations/publicada')->assertOk()->assertJsonPath('slug', 'publicada');
        $this->getJson('/api/v1/occupations/rascunho')->assertNotFound();
        $this->getJson('/api/v1/occupations/sem-guia')->assertNotFound();
        $this->getJson('/api/v1/occupations/nao-existe')->assertNotFound();
        $this->getJson('/api/v1/institutions/nao-existe')->assertNotFound();
        $this->getJson('/api/v1/courses/nao-existe')->assertNotFound();
        $this->getJson('/api/v1/companies/nao-existe')->assertNotFound();
    }

    public function test_the_language_comes_from_accept_language_and_falls_back_to_portuguese(): void
    {
        Area::factory()->create(['slug' => 'health', 'name' => ['pt' => 'Saúde', 'en' => 'Health']] + self::PUBLISHED);

        $this->getJson('/api/v1/areas', ['Accept-Language' => 'en'])
            ->assertHeader('Content-Language', 'en')
            ->assertExactJson([['id' => 'health', 'name' => 'Health']]);
        $this->getJson('/api/v1/areas', ['Accept-Language' => 'fr'])->assertExactJson([['id' => 'health', 'name' => 'Saúde']]);
        $this->getJson('/api/v1/areas', ['Accept-Language' => 'de'])
            ->assertHeader('Content-Language', 'pt')
            ->assertExactJson([['id' => 'health', 'name' => 'Saúde']]);
    }

    public function test_an_answer_has_an_etag_and_a_client_that_has_it_gets_a_304(): void
    {
        Area::factory()->create(['slug' => 'health'] + self::PUBLISHED);

        $response = $this->getJson('/api/v1/areas')->assertOk();
        $this->assertStringContainsString('Accept-Language', (string) $response->headers->get('Vary'));
        $etag = $response->headers->get('ETag');
        $this->assertIsString($etag);
        $this->assertStringContainsString('max-age=300', (string) $response->headers->get('Cache-Control'));
        $this->assertStringContainsString('public', (string) $response->headers->get('Cache-Control'));

        $again = $this->getJson('/api/v1/areas', ['If-None-Match' => $etag]);
        $again->assertStatus(304);
        $this->assertSame('', $again->getContent());
        $this->getJson('/api/v1/areas', ['If-None-Match' => '"outra"'])->assertOk();
    }

    public function test_answers_are_cached_until_the_content_changes(): void
    {
        $area = Area::factory()->create(['slug' => 'zona', 'name' => ['pt' => 'Saúde'], 'position' => 99] + self::PUBLISHED);
        $this->getJson('/api/v1/areas')->assertJsonFragment(['id' => 'zona', 'name' => 'Saúde']);

        // A write that skips the models (as a link table does) is not seen while the answer is cached…
        DB::table('areas')->where('id', $area->id)->update(['name' => json_encode(['pt' => 'Saúde pública'])]);
        $this->getJson('/api/v1/areas')->assertJsonFragment(['id' => 'zona', 'name' => 'Saúde']);

        // …a change through the model clears it.
        $area->refresh()->setTranslation('name', 'pt', 'Medicina')->save();
        $this->getJson('/api/v1/areas')->assertJsonFragment(['id' => 'zona', 'name' => 'Medicina']);

        // So does an import (it syncs link tables without model events), and a deletion.
        DB::table('areas')->where('id', $area->id)->update(['name' => json_encode(['pt' => 'Saúde pública'])]);
        $this->assertSame(0, Artisan::call('kaye:import', ['--only' => 'areas']));
        $this->getJson('/api/v1/areas')->assertJsonFragment(['id' => 'zona', 'name' => 'Saúde pública']);
        $area->delete();
        $this->getJson('/api/v1/areas')->assertOk()->assertJsonMissing(['id' => 'zona']);
    }

    public function test_links_show_only_published_rows(): void
    {
        $institution = Institution::factory()->create(self::PUBLISHED);
        $offer = CourseOffer::factory()->for($institution)->for(Course::factory()->state(self::PUBLISHED))->create(self::PUBLISHED);
        $visible = Career::factory()->create(['slug' => 'visivel'] + self::PUBLISHED);
        $hidden = Career::factory()->create(['slug' => 'escondida']);
        $offer->careers()->sync([$hidden->id => ['position' => 0], $visible->id => ['position' => 1]]);
        CourseOffer::factory()->for($institution)->create(['slug' => 'oferta-rascunho']);

        $this->getJson("/api/v1/institutions/{$institution->slug}")
            ->assertOk()
            ->assertJsonCount(1, 'offers')
            ->assertJsonPath('offers.0.careers', ['visivel']);
        $this->getJson('/api/v1/courses')->assertJsonCount(1)->assertJsonPath('0.careers', ['visivel']);
    }

    public function test_lists_of_one_career_filter_by_the_slug_and_an_unknown_career_has_none(): void
    {
        $career = Career::factory()->create(['slug' => 'analista'] + self::PUBLISHED);
        $other = Career::factory()->create(['slug' => 'outra'] + self::PUBLISHED);
        $mine = FreeCourse::factory()->create(['slug' => 'meu'] + self::PUBLISHED);
        $mine->careers()->sync([$career->id => ['position' => 0]]);
        FreeCourse::factory()->create(['slug' => 'outro'] + self::PUBLISHED)->careers()->sync([$other->id => ['position' => 0]]);
        Testimonial::factory()->for($career)->create(['slug' => 'testemunho'] + self::PUBLISHED);
        Testimonial::factory()->for($other)->create(self::PUBLISHED);
        Testimonial::factory()->for($career)->create(['slug' => 'exemplo', 'example' => true]);

        $this->getJson('/api/v1/free-courses')->assertJsonCount(2);
        $this->getJson('/api/v1/free-courses?occupation=analista')->assertJsonCount(1)->assertJsonPath('0.id', 'meu');
        $this->getJson('/api/v1/free-courses?occupation=nao-existe')->assertExactJson([]);
        $this->getJson('/api/v1/occupations/analista/testimonials')->assertJsonCount(1)->assertJsonPath('0.id', 'testemunho');
        $this->getJson('/api/v1/occupations/nao-existe/testimonials')->assertExactJson([]);
    }

    public function test_a_kurso_lesson_or_exam_that_does_not_exist_answers_404(): void
    {
        $kurso = Kurso::factory()->create(['slug' => 'dados'] + self::PUBLISHED);
        KursoUnit::factory()->for($kurso)->create(['slug' => 'u1', 'content' => ['lessons' => []]] + self::PUBLISHED);
        KursoUnit::factory()->for($kurso)->create(['slug' => 'u2', 'number' => 2, 'content' => null] + self::PUBLISHED);
        KursoUnit::factory()->for($kurso)->create(['slug' => 'u3', 'number' => 3, 'content' => ['lessons' => []]]);
        Kurso::factory()->create(['slug' => 'rascunho']);

        $this->getJson('/api/v1/kursos')->assertJsonCount(1, 'kursos')->assertJsonCount(2, 'kursos.0.units');
        $this->getJson('/api/v1/kursos/dados/units/u1')->assertExactJson(['lessons' => []]);
        $this->getJson('/api/v1/kursos/dados/units/u2')->assertNotFound();
        $this->getJson('/api/v1/kursos/dados/units/u3')->assertNotFound();
        $this->getJson('/api/v1/kursos/rascunho/exam')->assertNotFound();
        $this->getJson('/api/v1/kursos/dados/exam')->assertExactJson([]);
    }

    /**
     * The export has none of these yet, so the parity test cannot see their shape: each field of the type, the
     * optional ones only when set.
     */
    public function test_the_lists_the_export_still_leaves_empty_have_the_shape_of_their_types(): void
    {
        $career = Career::factory()->create(['slug' => 'enfermeiro'] + self::PUBLISHED);
        $institution = Institution::factory()->create(['slug' => 'exemplo', 'name' => 'Instituto Exemplo', 'ownership' => 'privada', 'logo' => 'logo.webp'] + self::PUBLISHED);
        $course = Course::factory()->create(['slug' => 'enfermagem', 'name' => ['pt' => 'Enfermagem']] + self::PUBLISHED);
        $program = Program::factory()->for($institution)->for($course)->create([
            'slug' => 'enf-exemplo', 'name' => 'Enfermagem', 'total_cost' => 900000, 'recognized' => true,
            'rating_average' => 4.5, 'rating_count' => 12,
        ] + self::PUBLISHED);
        $program->careers()->sync([$career->id => ['position' => 0]]);
        Program::factory()->for(Institution::factory())->for($course)->create(self::PUBLISHED);
        Figure::factory()->create([
            'slug' => 'figura', 'name' => 'Ana', 'role' => ['pt' => 'Médica'], 'why' => ['pt' => 'Porque sim.'],
            'follow' => ['label' => 'LinkedIn', 'url' => 'https://example.org'], 'source' => ['label' => 'JA', 'url' => 'https://example.org/ja'],
        ] + self::PUBLISHED)->careers()->sync([$career->id => ['position' => 0]]);
        Mentor::factory()->create([
            'slug' => 'mentor', 'name' => 'Rui', 'role' => 'Enfermeiro', 'company' => 'Hospital', 'bio' => ['pt' => 'Bio.'],
            'languages' => ['pt', 'umb'], 'consent_at' => '2026-10-01', 'availability' => 'grupo',
        ] + self::PUBLISHED);
        VideoStory::factory()->for($career)->create([
            'slug' => 'video', 'name' => 'Rui', 'role' => 'Enfermeiro', 'title' => ['pt' => 'O meu dia'], 'url' => 'https://youtu.be/x',
            'platform' => 'youtube', 'duration_seconds' => 75, 'consent_at' => '2026-10-01', 'recorded_at' => '2026-10-02',
        ] + self::PUBLISHED);

        $this->getJson('/api/v1/programs?occupation=enfermeiro')->assertExactJson([[
            'id' => 'enf-exemplo',
            'institution' => ['id' => 'exemplo', 'name' => 'Instituto Exemplo', 'type' => 'universidade', 'ownership' => 'privada', 'province' => 'Luanda', 'logo' => 'logo.webp'],
            'course' => ['id' => 'enfermagem', 'name' => 'Enfermagem'],
            'name' => 'Enfermagem', 'level' => 'licenciatura', 'durationMonths' => 48, 'schedule' => ['diurno'],
            'totalCost' => 900000, 'recognized' => true, 'rating' => ['average' => 4.5, 'count' => 12], 'careers' => ['enfermeiro'],
        ]]);
        $this->getJson('/api/v1/programs')->assertJsonCount(1)->assertJsonPath('0.id', 'enf-exemplo');
        $this->getJson('/api/v1/figures')->assertExactJson([[
            'id' => 'figura', 'name' => 'Ana', 'role' => 'Médica', 'why' => 'Porque sim.', 'careers' => ['enfermeiro'],
            'follow' => ['label' => 'LinkedIn', 'url' => 'https://example.org'], 'source' => ['label' => 'JA', 'url' => 'https://example.org/ja'],
        ]]);
        $this->getJson('/api/v1/mentors')->assertExactJson([[
            'id' => 'mentor', 'name' => 'Rui', 'role' => 'Enfermeiro', 'company' => 'Hospital', 'careers' => [], 'bio' => 'Bio.',
            'languages' => ['pt', 'umb'], 'consentAt' => '2026-10-01', 'availability' => 'grupo',
        ]]);
        $this->getJson('/api/v1/video-stories')->assertExactJson([[
            'id' => 'video', 'careerSlug' => 'enfermeiro', 'name' => 'Rui', 'role' => 'Enfermeiro', 'title' => 'O meu dia',
            'url' => 'https://youtu.be/x', 'platform' => 'youtube', 'durationSeconds' => 75, 'consentAt' => '2026-10-01', 'recordedAt' => '2026-10-02',
        ]]);
    }

    public function test_a_dataset_that_is_not_published_answers_404(): void
    {
        Dataset::factory()->create(['slug' => 'jobs', 'data' => ['postings' => 3]] + self::PUBLISHED);
        Dataset::factory()->create(['slug' => 'education', 'data' => ['total' => 1]]);

        $this->getJson('/api/v1/market/jobs')->assertExactJson(['postings' => 3]);
        $this->getJson('/api/v1/market/education')->assertNotFound();
        $this->getJson('/api/v1/market/employment')->assertNotFound();
    }
}
