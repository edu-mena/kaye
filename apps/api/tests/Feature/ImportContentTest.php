<?php

namespace Tests\Feature;

use App\Enums\ContentStatus;
use App\Models\AssessmentQuestion;
use App\Models\Career;
use App\Models\CareerGroup;
use App\Models\Testimonial;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Tests\TestCase;

/**
 * `kaye:import` (ADR 0019): the real export goes in whole and a second run changes nothing; a file that does not
 * match the manifest, or a link to a slug that does not exist, stops the import and says why.
 */
class ImportContentTest extends TestCase
{
    use RefreshDatabase;

    private string $fixtures;

    protected function setUp(): void
    {
        parent::setUp();
        $this->fixtures = storage_path('framework/testing/import-'.uniqid());
    }

    protected function tearDown(): void
    {
        File::deleteDirectory($this->fixtures);
        parent::tearDown();
    }

    public function test_the_seeder_imports_the_whole_export_with_the_manifest_counts_and_a_second_run_changes_nothing(): void
    {
        $this->seed();

        $data = database_path('data');
        $manifest = $this->decode("{$data}/manifest.json");
        $records = fn (string $resource): int => $this->int(data_get($manifest, "{$resource}.pt.records"));
        $file = fn (string $resource): array => $this->decode("{$data}/{$resource}.pt.json");
        $nested = fn (string $resource, string $field): int => array_sum(array_map(
            fn (mixed $record): int => is_array($record) && is_array($record[$field] ?? null) ? count($record[$field]) : 0,
            $file($resource),
        ));

        $expected = [
            'areas' => $records('areas'),
            'career_groups' => $records('career-groups'),
            'skills' => $records('skills'),
            'support_programs' => $records('support-programs'),
            'careers' => $records('careers'),
            'pathways' => $nested('career-details', 'pathways'),
            'career_skill' => $nested('career-details', 'skills'),
            'institutions' => $records('institutions'),
            'courses' => $records('courses'),
            'course_offers' => $nested('institutions', 'offers'),
            'companies' => $records('companies'),
            'scholarships' => $records('scholarships'),
            'internships' => $records('internships'),
            'free_courses' => $records('free-courses'),
            'admissions' => $records('admissions'),
            'programs' => $records('programs'),
            'news' => $records('news'),
            'events' => count(array_filter($file('news'), fn (mixed $news): bool => is_array($news) && isset($news['event']))),
            'figures' => $records('figures'),
            'cv_examples' => $records('cv-examples'),
            'testimonials' => $records('testimonials'),
            'mentors' => $records('mentors'),
            'video_stories' => $records('video-stories'),
            'assessment_questions' => $records('assessment-questions'),
            'access_exam_questions' => $records('access-exam-questions'),
            'interview_questions' => $records('interview-questions'),
            'kursos' => $records('kursos') + $records('kursos-announced'),
            'kurso_units' => $nested('kursos', 'units'),
            'kurso_exam_questions' => $nested('kursos', 'exam'),
            'datasets' => 5,
        ];
        foreach ($expected as $table => $count) {
            $this->assertSame($count, DB::table($table)->count(), $table);
        }
        $this->assertSame(Career::count(), Career::published()->count());
        $this->assertSame(0, Testimonial::published()->where('example', true)->count(), 'Made-up testimonials stay drafts');

        $history = DB::table('activity_log')->count();
        $this->assertSame(0, Artisan::call('kaye:import'));
        $output = Artisan::output();

        $this->assertStringContainsString('Import complete.', $output);
        preg_match_all('/^\|\s*([a-z-]+)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*$/m', $output, $rows, PREG_SET_ORDER);
        $this->assertCount(31, $rows);
        foreach ($rows as [, $resource, , $created, $updated, $errors]) {
            $this->assertSame(['0', '0', '0'], [$created, $updated, $errors], $resource);
        }
        $this->assertSame($history, DB::table('activity_log')->count(), 'A second run writes nothing');
    }

    public function test_a_file_whose_hash_does_not_match_the_manifest_is_refused(): void
    {
        $this->fixture(['areas' => [['id' => 'health', 'name' => 'Saúde', 'position' => 0]]]);
        File::put("{$this->fixtures}/areas.en.json", '[{"id":"health","name":"Tampered","position":0}]');

        $this->assertSame(1, Artisan::call('kaye:import'));

        $this->assertStringContainsString('areas.en.json: the SHA-256 does not match manifest.json', Artisan::output());
        $this->assertSame(0, DB::table('areas')->count());
    }

    public function test_a_manifest_with_the_wrong_number_of_records_is_refused(): void
    {
        $this->fixture(['areas' => [['id' => 'health', 'name' => 'Saúde', 'position' => 0]]], records: 2);

        $this->assertSame(1, Artisan::call('kaye:import'));

        $this->assertStringContainsString('areas.pt.json: 1 records, manifest.json says 2', Artisan::output());
    }

    public function test_a_link_to_a_slug_that_does_not_exist_fails_listing_every_case(): void
    {
        $this->fixture([
            'areas' => [['id' => 'health', 'name' => 'Saúde', 'position' => 0]],
            'career-groups' => [
                ['id' => 'enfermagem', 'area' => 'health', 'name' => 'Enfermagem', 'position' => 0],
                ['id' => 'medicina', 'area' => 'medicine', 'name' => 'Medicina', 'position' => 1],
                ['id' => 'pescas', 'area' => 'fishing', 'name' => 'Pescas', 'position' => 2],
            ],
        ]);

        $this->assertSame(1, Artisan::call('kaye:import', ['--only' => 'areas,career-groups']));
        $output = Artisan::output();

        $this->assertStringContainsString("career-groups medicina: areas 'medicine' does not exist", $output);
        $this->assertStringContainsString("career-groups pescas: areas 'fishing' does not exist", $output);
        $this->assertSame(1, DB::table('areas')->count(), 'The resources before it are kept');
        $this->assertSame(0, CareerGroup::count(), 'The failed resource is rolled back whole, valid rows included');
    }

    public function test_a_slug_that_appears_twice_fails(): void
    {
        $this->fixture(['areas' => [
            ['id' => 'health', 'name' => 'Saúde', 'position' => 0],
            ['id' => 'health', 'name' => 'Saúde outra vez', 'position' => 1],
        ]]);

        $this->assertSame(1, Artisan::call('kaye:import', ['--only' => 'areas']));

        $this->assertStringContainsString("areas: 'health' appears twice", Artisan::output());
        $this->assertSame(0, DB::table('areas')->count());
    }

    public function test_the_three_languages_go_into_one_record_and_a_change_updates_it(): void
    {
        $question = fn (string $text): array => [['id' => 'R1', 'dimension' => 'R', 'text' => $text, 'position' => 0]];
        $this->fixture(['assessment-questions' => [
            'pt' => $question('consertar um motor'),
            'en' => $question('fixing an engine'),
            'fr' => $question('consertar um motor'),
        ]]);

        $this->assertSame(0, Artisan::call('kaye:import', ['--only' => 'assessment-questions']));

        $stored = AssessmentQuestion::sole();
        $this->assertSame(['pt' => 'consertar um motor', 'en' => 'fixing an engine'], $stored->getTranslations('text'));
        $this->assertSame('fixing an engine', $stored->getTranslation('text', 'en'));
        $this->assertSame('consertar um motor', $stored->getTranslation('text', 'fr'), 'A language not translated yet falls back to Portuguese');
        $this->assertSame(ContentStatus::Published, $stored->status);

        $this->fixture(['assessment-questions' => $question('reparar um motor')]);
        $this->assertSame(0, Artisan::call('kaye:import', ['--only' => 'assessment-questions']));

        $this->assertMatchesRegularExpression('/assessment-questions\s*\|\s*1\s*\|\s*0\s*\|\s*1\s*\|\s*0/', Artisan::output());
        $this->assertSame(['pt' => 'reparar um motor'], $stored->refresh()->getTranslations('text'));
    }

    public function test_a_manifest_without_a_language_or_with_invalid_json_is_refused(): void
    {
        $this->fixture(['areas' => [['id' => 'health', 'name' => 'Saúde', 'position' => 0]]]);
        $manifest = $this->decode("{$this->fixtures}/manifest.json");
        File::put("{$this->fixtures}/manifest.json", json_encode(['areas' => Arr::except((array) $manifest['areas'], 'fr')], JSON_THROW_ON_ERROR));

        $this->assertSame(1, Artisan::call('kaye:import'));
        $this->assertStringContainsString('areas.fr: missing or incomplete in manifest.json', Artisan::output());

        File::put("{$this->fixtures}/manifest.json", '{"areas": ');
        $this->assertSame(1, Artisan::call('kaye:import'));
        $this->assertStringContainsString('manifest.json: invalid JSON', Artisan::output());
    }

    public function test_a_record_that_is_not_the_same_in_every_language_fails(): void
    {
        $area = fn (string $id): array => [['id' => $id, 'name' => 'Saúde', 'position' => 0]];
        $this->fixture(['areas' => ['pt' => $area('health'), 'en' => $area('saude'), 'fr' => $area('health')]]);

        $this->assertSame(1, Artisan::call('kaye:import', ['--only' => 'areas']));

        $this->assertStringContainsString('areas: record 0 is not the same in every language', Artisan::output());
    }

    public function test_an_unknown_resource_is_refused(): void
    {
        $this->fixture(['areas' => []]);

        $this->assertSame(1, Artisan::call('kaye:import', ['--only' => 'carrers']));

        $this->assertStringContainsString('Unknown: carrers', Artisan::output());
    }

    public function test_a_missing_manifest_is_refused(): void
    {
        config(['kaye.data_path' => $this->fixtures]);

        $this->assertSame(1, Artisan::call('kaye:import'));

        $this->assertStringContainsString('manifest.json is missing or empty', Artisan::output());
    }

    /**
     * Writes an export: resource => records (the same in every language) or locale => records, and its manifest.
     *
     * @param  array<string, array<array-key, mixed>>  $resources
     */
    private function fixture(array $resources, ?int $records = null): void
    {
        File::ensureDirectoryExists($this->fixtures);
        $manifest = [];
        foreach ($resources as $resource => $data) {
            $byLocale = isset($data['pt']) ? $data : ['pt' => $data, 'en' => $data, 'fr' => $data];
            foreach ($byLocale as $locale => $records_) {
                $text = json_encode($records_, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR)."\n";
                File::put("{$this->fixtures}/{$resource}.{$locale}.json", $text);
                $manifest[$resource][$locale] = [
                    'file' => "{$resource}.{$locale}.json",
                    'records' => $records ?? (is_array($records_) ? count($records_) : 1),
                    'sha256' => hash('sha256', $text),
                ];
            }
        }
        File::put("{$this->fixtures}/manifest.json", json_encode($manifest, JSON_THROW_ON_ERROR));
        config(['kaye.data_path' => $this->fixtures]);
    }

    private function int(mixed $value): int
    {
        $this->assertIsInt($value);

        return $value;
    }

    /**
     * @return array<array-key, mixed>
     */
    private function decode(string $file): array
    {
        $data = json_decode(File::get($file), true, flags: JSON_THROW_ON_ERROR);
        $this->assertIsArray($data);

        return $data;
    }
}
