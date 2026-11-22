<?php

namespace App\Support;

use App\Models\Area;
use App\Models\Career;
use App\Models\Company;
use App\Models\Institution;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Str;

/**
 * Decides whether a piece of news is about training, work, grants, public competitions, a company of the
 * catalogue or a career, and what it is linked to (areas, companies, institutions, careers). Names and words are
 * compared without accents and in lowercase, as whole words.
 *
 * @phpstan-type Links array{areas: list<int>, companies: list<int>, institutions: list<int>, careers: list<int>, topic: bool}
 */
final class NewsClassifier
{
    /** Shorter names (acronyms, common words) match too much. */
    private const int MIN_NAME_LENGTH = 4;

    /** @var array<int, string>|null */
    private ?array $companies = null;

    /** @var array<int, string>|null */
    private ?array $institutions = null;

    /** @var array<int, array{name: string, area: ?int}>|null */
    private ?array $careers = null;

    /** @var array<string, int>|null */
    private ?array $areaIds = null;

    /**
     * Null when the news has nothing to do with Kayé's subjects.
     *
     * @return Links|null
     */
    public function classify(string $title, string $lead): ?array
    {
        $text = self::normalise($title.' '.$lead);

        $topic = self::mentionsAny($text, Config::array('news.topics'));
        $companies = $this->matching($this->companies(), $text);
        $institutions = $this->matching($this->institutions(), $text);
        $careers = [];
        $areas = [];
        foreach ($this->careers() as $id => $career) {
            if (self::mentions($text, $career['name'])) {
                $careers[] = $id;
                if ($career['area'] !== null) {
                    $areas[] = $career['area'];
                }
            }
        }
        if (! $topic && $companies === [] && $institutions === [] && $careers === []) {
            return null;
        }

        foreach (Config::array('news.area_keywords') as $slug => $words) {
            $id = $this->areaIds()[$slug] ?? null;
            if ($id !== null && is_array($words) && self::mentionsAny($text, array_values(array_filter($words, is_string(...))))) {
                $areas[] = $id;
            }
        }

        return [
            'areas' => array_values(array_unique($areas)),
            'companies' => $companies,
            'institutions' => $institutions,
            'careers' => $careers,
            'topic' => $topic,
        ];
    }

    public static function normalise(string $text): string
    {
        return mb_strtolower(Str::ascii($text));
    }

    /**
     * @param  array<int, string>  $names
     * @return list<int>
     */
    private function matching(array $names, string $text): array
    {
        $found = [];
        foreach ($names as $id => $name) {
            if (self::mentions($text, $name)) {
                $found[] = $id;
            }
        }

        return $found;
    }

    /**
     * @param  array<mixed>  $words
     */
    private static function mentionsAny(string $text, array $words): bool
    {
        foreach ($words as $word) {
            if (is_string($word) && self::mentions($text, $word)) {
                return true;
            }
        }

        return false;
    }

    private static function mentions(string $text, string $word): bool
    {
        return preg_match('/(?<![a-z0-9])'.preg_quote($word, '/').'(?![a-z0-9])/', $text) === 1;
    }

    /**
     * @return array<int, string>
     */
    private function companies(): array
    {
        return $this->companies ??= self::names(Company::query()->published()->get(['id', 'name'])
            ->mapWithKeys(fn (Company $company): array => [$company->id => $company->name])->all());
    }

    /**
     * @return array<int, string>
     */
    private function institutions(): array
    {
        return $this->institutions ??= self::names(Institution::query()->published()->where('example', false)->get(['id', 'name'])
            ->mapWithKeys(fn (Institution $institution): array => [$institution->id => $institution->name])->all());
    }

    /**
     * @return array<int, array{name: string, area: ?int}>
     */
    private function careers(): array
    {
        if ($this->careers === null) {
            $this->careers = [];
            foreach (Career::query()->published()->with('group:id,area_id')->get() as $career) {
                $translated = $career->getTranslation('name', 'pt', false);
                $name = is_string($translated) ? self::normalise($translated) : '';
                if (mb_strlen($name) >= self::MIN_NAME_LENGTH + 2) {
                    $this->careers[$career->id] = ['name' => $name, 'area' => $career->group?->area_id];
                }
            }
        }

        return $this->careers;
    }

    /**
     * @return array<string, int>
     */
    private function areaIds(): array
    {
        if ($this->areaIds === null) {
            $this->areaIds = [];
            foreach (Area::query()->published()->get(['id', 'slug']) as $area) {
                $this->areaIds[$area->slug] = $area->id;
            }
        }

        return $this->areaIds;
    }

    /**
     * @param  array<int, string>  $names
     * @return array<int, string>
     */
    private static function names(array $names): array
    {
        $kept = [];
        foreach ($names as $id => $name) {
            $name = self::normalise($name);
            if (mb_strlen($name) >= self::MIN_NAME_LENGTH) {
                $kept[$id] = $name;
            }
        }

        return $kept;
    }
}
