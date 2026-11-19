<?php

namespace App\Support;

use App\Enums\ContentStatus;
use App\Http\Resources\CareerResource;
use App\Http\Resources\ContentResource;
use App\Http\Resources\InstitutionResource;
use App\Http\Resources\OfferResource;
use App\Models\Area;
use App\Models\Career;
use App\Models\CareerGroup;
use App\Models\Course;
use App\Models\CourseOffer;
use App\Models\Institution;
use App\Models\Pathway;
use App\Models\Program;
use App\Models\Skill;
use Closure;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Http\Request;

/**
 * The parts of the public API that are computed from several tables, as the app computed them from its demo
 * data: the institutions with their offers, the courses (domain/courses.ts, catalogCourses) and the careers'
 * traits (domain/recommend.ts, careerTraits). Only published rows, linked only to published rows.
 */
final class Catalog
{
    /** The levels in the order a person meets them (OFFER_LEVELS). */
    private const array OFFER_LEVELS = ['formacao_profissional', 'medio_tecnico', 'licenciatura', 'especialidade', 'mestrado', 'certificacao'];

    /** The level an academic step gives, as a way in (ENTRY_OF); any other level is a degree. */
    private const array ENTRY_OF = ['primario' => 'short', 'i_ciclo' => 'short', 'ii_ciclo' => 'short', 'medio_tecnico' => 'technical'];

    private const array ENTRY_RANK = ['short' => 0, 'technical' => 1, 'degree' => 2];

    /** @var Collection<int, Institution>|null */
    private ?Collection $institutions = null;

    /**
     * Only the published rows of an eager-loaded relation, by their position (after the link's own order, when
     * the relation has one).
     *
     * @return Closure(Relation<*, *, *>): void
     */
    public static function published(): Closure
    {
        return function (Relation $query): void {
            $model = $query->getModel();
            $query->where($model->qualifyColumn('status'), ContentStatus::Published->value)->orderBy($model->qualifyColumn('position'));
        };
    }

    /**
     * For whereHas: the related row is published.
     *
     * @return Closure(Builder<*>): void
     */
    public static function isPublished(): Closure
    {
        return function (Builder $query): void {
            $query->where($query->qualifyColumn('status'), ContentStatus::Published->value);
        };
    }

    /**
     * A link to other rows (careers, by default), of which only the published slugs are shown, in the link's order.
     *
     * @return array<string, Closure(Relation<*, *, *>): void>
     */
    public static function links(string $relation = 'careers', ?string $table = null): array
    {
        $table ??= $relation;

        return [$relation => function (Relation $query) use ($table): void {
            $query->where("{$table}.status", ContentStatus::Published->value)->select("{$table}.id", "{$table}.slug");
        }];
    }

    /**
     * The published institutions, with their offers ready for OfferResource.
     *
     * @return Collection<int, Institution>
     */
    public function institutions(?string $slug = null): Collection
    {
        if ($slug === null && $this->institutions !== null) {
            return $this->institutions;
        }
        $institutions = Institution::query()->published()->orderBy('position')
            ->when($slug !== null, fn (Builder $query): Builder => $query->where('slug', $slug))
            ->with([
                'averageFee',
                'courseOffers' => fn (Relation $query): Relation => $query->where('course_offers.status', ContentStatus::Published->value)
                    ->whereHas('course', self::isPublished())
                    ->orderBy('position'),
                'courseOffers.course',
                'courseOffers.tuitionFee',
                ...self::prefixed('courseOffers.', self::links()),
            ])
            ->get();
        foreach ($institutions as $institution) {
            foreach ($institution->courseOffers as $offer) {
                $offer->setRelation('institution', $institution);
            }
        }

        return $slug === null ? $this->institutions = $institutions : $institutions;
    }

    /**
     * Every course, with its offer at each institution (`CatalogCourse`), in the courses' order.
     *
     * @return list<array<string, mixed>>
     */
    public function courses(Request $request): array
    {
        $areaOf = $this->areaOfGroup();
        $areaOrder = self::strings(Area::query()->orderBy('position')->pluck('slug')->all());
        $byCourse = [];
        foreach ($this->institutions() as $institution) {
            foreach ($institution->courseOffers as $offer) {
                $byCourse[$offer->course_id][] = $offer;
            }
        }

        $courses = Course::query()->published()->orderBy('position')->whereIn('id', array_keys($byCourse))->get();

        return array_values($courses->map(function (Course $course) use ($byCourse, $request, $areaOf, $areaOrder): array {
            $offers = $byCourse[$course->id];
            $levels = $areas = $careers = [];
            $students = $graduates = 0;
            foreach ($offers as $offer) {
                $levels[] = $offer->getAttribute('level');
                foreach (self::strings($offer->getAttribute('groups')) as $group) {
                    $areas[] = $areaOf[$group] ?? null;
                }
                $careers = [...$careers, ...ContentResource::slugsOf($offer->careers)];
                $students += self::int($offer->getAttribute('students'));
                $graduates += self::int($offer->getAttribute('graduates'));
            }

            return [
                'id' => $course->slug,
                'name' => $course->getAttribute('name'),
                'levels' => array_values(array_intersect(self::OFFER_LEVELS, self::strings($levels))),
                'areas' => array_values(array_intersect($areaOrder, self::strings($areas))),
                'careers' => array_values(array_unique($careers)),
                'offers' => array_map(fn (CourseOffer $offer): array => [
                    'academy' => InstitutionResource::summary($offer->institution),
                    'offer' => (new OfferResource($offer))->resolve($request),
                ], $offers),
                'students' => $students,
                'graduates' => $graduates,
            ];
        })->all());
    }

    /**
     * The curated careers in what the recommendation weighs (`CareerTraits`).
     *
     * @return list<array<string, mixed>>
     */
    public function careerTraits(Request $request): array
    {
        $places = $this->places($request);
        $careers = Career::query()->published()->where('detailed', true)->orderBy('position')
            ->with(['skills' => self::published(), 'pathways' => self::published()])
            ->get();

        return array_values($careers->map(function (Career $career) use ($places): array {
            $taught = array_filter($places, fn (array $place): bool => in_array($career->slug, $place['careers'], true));

            return [
                'slug' => $career->slug,
                'skills' => CareerResource::skills($career),
                'workStyles' => $career->getAttribute('work_styles'),
                'entry' => self::entry($career),
                'provinces' => array_values(array_unique(array_map(
                    fn (array $place): string => $place['province'],
                    array_filter($taught, fn (array $place): bool => ! $place['online']),
                ))),
                'online' => array_filter($taught, fn (array $place): bool => $place['online']) !== [],
            ];
        })->all());
    }

    /**
     * The skills of the published careers, each once (`Skill`): the importance is the one of the last career
     * that asks for it, as the app's Map kept it.
     *
     * @return Collection<int, Skill>
     */
    public function skills(): Collection
    {
        $importance = [];
        $careers = Career::query()->published()->orderBy('position')->with(['skills' => self::published()])->get();
        foreach ($careers as $career) {
            foreach ($career->skills as $skill) {
                $importance[$skill->id] = CareerResource::link($skill)?->getAttribute('importance');
            }
        }

        $skills = Skill::query()->published()->orderBy('position')->whereIn('id', array_keys($importance))->get();
        foreach ($skills as $skill) {
            $skill->setAttribute('importance', $importance[$skill->id]);
        }

        return $skills;
    }

    /**
     * Where each career is taught: the programmes, and the institutions that offer its courses.
     *
     * @return list<array{careers: list<string>, province: string, online: bool}>
     */
    private function places(Request $request): array
    {
        $places = [];
        $programs = Program::query()->published()->orderBy('position')
            ->whereHas('institution', self::isPublished())
            ->with(['institution', ...self::links()])->get();
        foreach ($programs as $program) {
            $places[] = [
                'careers' => ContentResource::slugsOf($program->careers),
                'province' => self::string($program->institution?->getAttribute('province')),
                'online' => in_array('online', self::strings($program->getAttribute('schedule')), true)
                    || $program->institution?->getAttribute('type') === 'online',
            ];
        }
        foreach ($this->courses($request) as $course) {
            $careers = self::strings($course['careers']);
            foreach (is_array($course['offers']) ? $course['offers'] : [] as $offer) {
                $academy = is_array($offer) && is_array($offer['academy'] ?? null) ? $offer['academy'] : [];
                $places[] = [
                    'careers' => $careers,
                    'province' => self::string($academy['province'] ?? null),
                    'online' => ($academy['type'] ?? null) === 'online',
                ];
            }
        }

        return $places;
    }

    /**
     * The quickest way in: of each pathway, the highest level its essential academic steps need.
     *
     * @return array{level: string, pathway: mixed}|null
     */
    private static function entry(Career $career): ?array
    {
        $best = null;
        foreach ($career->pathways as $pathway) {
            $level = self::entryLevel($pathway);
            if ($best === null || self::ENTRY_RANK[$level] < self::ENTRY_RANK[$best['level']]) {
                $best = ['level' => $level, 'pathway' => $pathway->getAttribute('name')];
            }
        }

        return $best;
    }

    private static function entryLevel(Pathway $pathway): string
    {
        $level = 'short';
        $steps = $pathway->getAttribute('steps');
        foreach (is_array($steps) ? $steps : [] as $step) {
            if (! is_array($step) || ($step['kind'] ?? null) !== 'academico' || ($step['need'] ?? null) !== 'essencial') {
                continue;
            }
            $stepLevel = is_string($step['level'] ?? null) ? (self::ENTRY_OF[$step['level']] ?? 'degree') : 'degree';
            if (self::ENTRY_RANK[$stepLevel] > self::ENTRY_RANK[$level]) {
                $level = $stepLevel;
            }
        }

        return $level;
    }

    /**
     * @return array<string, string>
     */
    private function areaOfGroup(): array
    {
        $areas = [];
        foreach (CareerGroup::query()->with('area:id,slug')->get() as $group) {
            if ($group->area !== null) {
                $areas[$group->slug] = $group->area->slug;
            }
        }

        return $areas;
    }

    /**
     * @param  array<string, Closure>  $relations
     * @return array<string, Closure>
     */
    private static function prefixed(string $prefix, array $relations): array
    {
        $prefixed = [];
        foreach ($relations as $name => $constraint) {
            $prefixed[$prefix.$name] = $constraint;
        }

        return $prefixed;
    }

    /**
     * @return list<string>
     */
    private static function strings(mixed $value): array
    {
        return is_array($value) ? array_values(array_filter($value, is_string(...))) : [];
    }

    private static function string(mixed $value): string
    {
        return is_string($value) ? $value : '';
    }

    private static function int(mixed $value): int
    {
        return is_int($value) ? $value : 0;
    }
}
