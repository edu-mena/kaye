<?php

namespace Tests\Feature;

use App\Enums\Locale;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Routing\Middleware\ThrottleRequests;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

/**
 * The parity of the API with the frontend's export (ADR 0019, docs/arquitetura.md section 6): every file of
 * database/data, in every language, imported and read back from its route, is the same data. A field more or
 * less, another value or another order of a list fails. Only the order of an object's keys and the export's
 * `position` (the order the list already has) are left out, and 2.0 is 2, as JavaScript reads it.
 */
class ApiParityTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Files whose records are routes of their own, or parts of another file's route.
     *
     * @var array<string, string>
     */
    private const ROUTES = [
        'areas' => '/areas',
        'career-groups' => '/career-groups',
        'careers' => '/occupations',
        'career-traits' => '/occupations?fields=traits',
        'skills' => '/skills',
        'support-programs' => '/support-programs',
        'programs' => '/programs',
        'institutions' => '/institutions',
        'courses' => '/courses',
        'companies' => '/companies',
        'market-jobs' => '/market/jobs',
        'market-education' => '/market/education',
        'market-employment' => '/market/employment',
        'news' => '/news',
        'scholarships' => '/scholarships',
        'internships' => '/internships',
        'free-courses' => '/free-courses',
        'admissions' => '/admissions',
        'figures' => '/figures',
        'assessment-questions' => '/assessment',
        'cv-examples' => '/cv-examples',
        'testimonials' => '/testimonials',
        'access-exam-questions' => '/access-exams',
        'interview-questions' => '/interview-questions',
        'psychotech' => '/psychotech',
        'mentors' => '/mentors',
        'video-stories' => '/video-stories',
        'provinces' => '/provinces',
    ];

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware(ThrottleRequests::class);
    }

    public function test_every_exported_file_comes_back_the_same_from_its_route_in_every_language(): void
    {
        $this->seed();
        // The import keeps the made-up examples as drafts; published here, so every field of every record is compared.
        foreach (Schema::getTableListing(schemaQualified: false) as $table) {
            if (Schema::hasColumn($table, 'status')) {
                DB::table($table)->update(['status' => 'published']);
            }
        }

        $manifest = $this->json_(database_path('data/manifest.json'));
        $files = array_keys($manifest);
        $covered = [...array_keys(self::ROUTES), 'career-details', 'kursos', 'kursos-announced'];
        $this->assertSame([], array_values(array_diff($files, $covered)), 'Files without a route in this test');

        $problems = [];
        foreach (Locale::values() as $locale) {
            foreach ($files as $file) {
                $expected = $this->expected($file, $locale);
                $actual = $this->actual($file, $locale, $expected);
                foreach (self::differences($expected, self::normalize($actual), "{$file}.{$locale}") as $problem) {
                    $problems[] = $problem;
                }
            }
        }

        $this->assertSame([], array_slice($problems, 0, 40), count($problems).' differences');
    }

    public function test_a_detail_is_its_list_item(): void
    {
        $this->seed();

        foreach (['institutions', 'courses', 'companies'] as $resource) {
            $list = $this->fetch("/{$resource}", 'pt');
            $this->assertIsArray($list);
            $this->assertNotSame([], $list);
            foreach ([reset($list), end($list)] as $item) {
                $this->assertIsArray($item);
                $this->assertIsString($item['id']);
                $this->assertSame($item, $this->fetch("/{$resource}/{$item['id']}", 'pt'), "{$resource}/{$item['id']}");
            }
        }
    }

    /**
     * The file as the API must answer it: in the export's order, without `position`.
     */
    private function expected(string $file, string $locale): mixed
    {
        $data = $this->json_(database_path("data/{$file}.{$locale}.json"));
        if (array_is_list($data) && $data !== [] && is_array($data[0]) && array_key_exists('position', $data[0])) {
            usort($data, fn (mixed $a, mixed $b): int => self::position($a) <=> self::position($b));
            $data = array_map(function (mixed $record): mixed {
                if (is_array($record)) {
                    unset($record['position']);
                }

                return $record;
            }, $data);
        }

        return self::normalize($data);
    }

    /**
     * What the API answers for one file; the guides and the Kursos are put together from their routes.
     */
    private function actual(string $file, string $locale, mixed $expected): mixed
    {
        if (isset(self::ROUTES[$file])) {
            return $this->fetch(self::ROUTES[$file], $locale);
        }
        if ($file === 'career-details') {
            return array_map(
                fn (mixed $career): mixed => $this->fetch('/occupations/'.self::field($career, 'slug'), $locale),
                is_array($expected) ? $expected : [],
            );
        }
        $kursos = $this->fetch('/kursos', $locale);
        $this->assertIsArray($kursos);
        if ($file === 'kursos-announced') {
            return $kursos['announced'];
        }

        return array_map(function (mixed $kurso) use ($locale): mixed {
            $this->assertIsArray($kurso);
            $id = self::field($kurso, 'id');
            $units = is_array($kurso['units'] ?? null) ? $kurso['units'] : [];
            $kurso['units'] = array_map(function (mixed $unit) use ($id, $locale): mixed {
                $this->assertIsArray($unit);
                $response = $this->getJson("/api/v1/kursos/{$id}/units/".self::field($unit, 'id'), ['Accept-Language' => $locale]);
                if ($response->status() === 200) {
                    $unit['content'] = $response->json();
                } else {
                    $response->assertNotFound();
                }

                return $unit;
            }, $units);
            $kurso['exam'] = $this->fetch("/kursos/{$id}/exam", $locale);

            return $kurso;
        }, is_array($kursos['kursos']) ? $kursos['kursos'] : []);
    }

    private function fetch(string $path, string $locale): mixed
    {
        $response = $this->getJson("/api/v1{$path}", ['Accept-Language' => $locale]);
        $response->assertOk();

        return json_decode((string) $response->getContent(), true, flags: JSON_THROW_ON_ERROR);
    }

    /**
     * Keys in order and whole numbers as integers, recursively.
     */
    private static function normalize(mixed $value): mixed
    {
        if (is_float($value) && floor($value) === $value) {
            return (int) $value;
        }
        if (! is_array($value)) {
            return $value;
        }
        $value = array_map(self::normalize(...), $value);
        if (! array_is_list($value)) {
            ksort($value);
        }

        return $value;
    }

    /**
     * Where two values differ: a missing or extra field, another value, another length.
     *
     * @return list<string>
     */
    private static function differences(mixed $expected, mixed $actual, string $path): array
    {
        if (! is_array($expected) || ! is_array($actual)) {
            return $expected === $actual ? [] : ["{$path}: expected ".self::show($expected).', got '.self::show($actual)];
        }
        if (array_is_list($expected) && array_is_list($actual) && count($expected) !== count($actual)) {
            return ["{$path}: expected ".count($expected).' items, got '.count($actual)];
        }
        $problems = [];
        foreach (array_unique([...array_keys($expected), ...array_keys($actual)]) as $key) {
            $at = array_is_list($expected) ? "{$path}[{$key}]" : "{$path}.{$key}";
            if (! array_key_exists($key, $actual)) {
                $problems[] = "{$at}: missing";
            } elseif (! array_key_exists($key, $expected)) {
                $problems[] = "{$at}: not in the export (".self::show($actual[$key]).')';
            } else {
                array_push($problems, ...self::differences($expected[$key], $actual[$key], $at));
            }
        }

        return $problems;
    }

    private static function show(mixed $value): string
    {
        return mb_strimwidth(json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?: '?', 0, 120, '…');
    }

    private static function position(mixed $record): int
    {
        return is_array($record) && is_int($record['position'] ?? null) ? $record['position'] : 0;
    }

    private static function field(mixed $record, string $key): string
    {
        return is_array($record) && is_string($record[$key] ?? null) ? $record[$key] : '';
    }

    /**
     * @return array<array-key, mixed>
     */
    private function json_(string $path): array
    {
        $data = json_decode((string) file_get_contents($path), true, flags: JSON_THROW_ON_ERROR);
        $this->assertIsArray($data);

        return $data;
    }
}
