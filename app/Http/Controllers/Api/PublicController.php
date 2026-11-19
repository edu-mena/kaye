<?php

namespace App\Http\Controllers\Api;

use App\Enums\ContentStatus;
use App\Models\Career;
use App\Support\PublicContent;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

/**
 * What the public reads of /api/v1 share (docs/arquitetura.md, section 6): the cached answer with its ETag,
 * only published rows, in their position.
 */
abstract class PublicController
{
    public function __construct(protected PublicContent $content) {}

    /**
     * The published rows of a model, by position.
     *
     * @template TModel of Model
     *
     * @param  class-string<TModel>  $model
     * @return Builder<TModel>
     */
    protected static function published(string $model): Builder
    {
        /** @var Builder<TModel> $query */
        $query = $model::query();

        return $query->where($query->qualifyColumn('status'), ContentStatus::Published->value)->orderBy($query->qualifyColumn('position'));
    }

    /**
     * Only the rows linked to one published career (`?occupation=` or the slug in the path); none for a
     * career that does not exist.
     *
     * @template TModel of Model
     *
     * @param  Builder<TModel>  $query
     * @return Builder<TModel>
     */
    protected static function ofCareer(Builder $query, ?string $slug, string $relation = 'careers'): Builder
    {
        return $slug === null ? $query : $query->whereHas(
            $relation,
            fn (Builder $career): Builder => $career->where('careers.slug', $slug)->where('careers.status', ContentStatus::Published->value),
        );
    }

    protected static function occupation(Request $request): ?string
    {
        $slug = $request->query('occupation');

        return is_string($slug) && $slug !== '' ? $slug : null;
    }

    /**
     * @return Builder<Career>
     */
    protected static function careers(): Builder
    {
        return self::published(Career::class);
    }
}
