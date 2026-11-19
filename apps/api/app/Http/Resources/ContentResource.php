<?php

namespace App\Http\Resources;

use App\Enums\Locale;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * A row of the content in the shape of apps/web/src/data/types.ts (docs/arquitetura.md, section 6). A field the
 * type marks optional (`logo?: string`) is left out when empty; one that can be null (`deadline: string | null`)
 * is always there. Translatable columns come in the request's language (SetLocaleFromRequest), Portuguese
 * when that one is missing.
 *
 * @template TModel of Model
 *
 * @property TModel $resource
 */
abstract class ContentResource extends JsonResource
{
    /**
     * The value of a column (translated, cast) of this row.
     */
    protected function value(string $column): mixed
    {
        return $this->resource->getAttribute($column);
    }

    /**
     * A date column as "2026-11-04".
     */
    protected function date(string $column): ?string
    {
        $value = $this->value($column);

        return $value instanceof CarbonInterface ? $value->toDateString() : null;
    }

    /**
     * True, or nothing: the flags the types write as `example?: true`.
     */
    protected function flag(string $column): ?bool
    {
        return $this->value($column) === true ? true : null;
    }

    /**
     * The slugs of related rows, in the order the relation gives.
     *
     * @return list<string>
     */
    protected function slugs(string $relation): array
    {
        $related = $this->resource->getRelationValue($relation);

        return is_iterable($related) ? self::slugsOf($related) : [];
    }

    /**
     * @param  iterable<mixed>  $models
     * @return list<string>
     */
    public static function slugsOf(iterable $models): array
    {
        $slugs = [];
        foreach ($models as $model) {
            if ($model instanceof Model && is_string($model->getAttribute('slug'))) {
                $slugs[] = $model->getAttribute('slug');
            }
        }

        return $slugs;
    }

    /**
     * The slug of a related row (a belongsTo), or null.
     */
    protected function slugOf(string $relation): ?string
    {
        $related = $this->resource->getRelationValue($relation);
        $slug = $related instanceof Model ? $related->getAttribute('slug') : null;

        return is_string($slug) ? $slug : null;
    }

    /**
     * A value stored as {"pt": …, "en": …} outside a translatable column (a link's own name), in the request's
     * language or in Portuguese.
     */
    protected static function translation(mixed $json): mixed
    {
        $values = is_string($json) ? json_decode($json, true) : null;

        return is_array($values) ? $values[app()->getLocale()] ?? $values[Locale::fallback()->value] ?? null : null;
    }

    /**
     * The fields, and those of `$optional` that are not null.
     *
     * @param  array<string, mixed>  $fields
     * @param  array<string, mixed>  $optional
     * @return array<string, mixed>
     */
    protected static function shape(array $fields, array $optional = []): array
    {
        return $fields + array_filter($optional, fn (mixed $value): bool => $value !== null);
    }

    /**
     * What a sourced row shares (SupportProgram, Scholarship, FreeCourse…): its sources and the day they were checked.
     *
     * @return array{sources: mixed, checkedAt: string|null}
     */
    protected function sourced(): array
    {
        return ['sources' => $this->value('sources'), 'checkedAt' => $this->date('source_checked_at')];
    }
}
