<?php

namespace Tests\Feature;

use App\Enums\ContentStatus;
use App\Models\Career;
use App\Models\CvExample;
use App\Models\KursoExamQuestion;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use PHPUnit\Framework\Attributes\DataProvider;
use ReflectionClass;
use ReflectionMethod;
use ReflectionNamedType;
use Tests\TestCase;

/**
 * The content models (docs/base-de-dados.md): every factory makes a valid row and every relation points to a real
 * table and column; the public API only sees what is published.
 */
class ContentModelsTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return iterable<string, array{class-string<Model>}>
     */
    public static function models(): iterable
    {
        // Data providers run before the application boots: no app_path() here.
        foreach (glob(__DIR__.'/../../app/Models/*.php') ?: [] as $file) {
            /** @var class-string<Model> $model */
            $model = 'App\\Models\\'.basename($file, '.php');
            if ($model !== User::class) {
                yield class_basename($model) => [$model];
            }
        }
    }

    /**
     * @param  class-string<Model>  $model
     */
    #[DataProvider('models')]
    public function test_the_factory_makes_a_row_and_every_relation_can_be_loaded(string $model): void
    {
        $row = Factory::factoryForModel($model)->createOne();
        $this->assertModelExists($row);

        $relations = $this->relations($model);
        foreach ($relations as $relation) {
            $query = $row->{$relation}();
            $this->assertInstanceOf(Relation::class, $query, $relation);
            $query->getResults();
        }
    }

    public function test_only_published_content_is_public(): void
    {
        $published = Career::factory()->create(['status' => ContentStatus::Published]);
        Career::factory()->create(['status' => ContentStatus::Draft]);
        Career::factory()->create(['status' => ContentStatus::Review]);
        Career::factory()->create(['status' => ContentStatus::Published])->delete();

        $this->assertSame([$published->id], Career::published()->pluck('id')->all());
        $this->assertSame(ContentStatus::Draft, (new Career)->status, 'New content starts as a draft');
    }

    public function test_relations_follow_the_links(): void
    {
        $example = CvExample::factory()->create();
        $question = KursoExamQuestion::factory()->create();

        $this->assertSame($example->career_id, $example->career?->id);
        $this->assertSame($example->pathway_id, $example->pathway?->id);
        $this->assertSame($question->kurso_unit_id, $question->unit?->id);
    }

    /**
     * The model's public methods that return a relation.
     *
     * @param  class-string<Model>  $model
     * @return list<string>
     */
    private function relations(string $model): array
    {
        $relations = [];
        foreach ((new ReflectionClass($model))->getMethods(ReflectionMethod::IS_PUBLIC) as $method) {
            $type = $method->getReturnType();
            if ($method->class === $model && $type instanceof ReflectionNamedType && is_subclass_of($type->getName(), Relation::class)) {
                $relations[] = $method->getName();
            }
        }

        return array_values(array_filter($relations, fn (string $name): bool => ! Str::startsWith($name, 'activities')));
    }
}
