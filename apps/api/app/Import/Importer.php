<?php

namespace App\Import;

use App\Enums\RevisionStatus;
use App\Models\Revision;
use BackedEnum;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\Pivot;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\SoftDeletingScope;
use Illuminate\Support\Facades\DB;
use LogicException;

/**
 * Writes resources row by row, each in its own transaction: a new key is created, a changed row is updated, an
 * equal row is left alone (so a second run changes nothing). Links are found by slug; a slug that does not exist
 * is a problem, and a resource with problems is rolled back and reported, never half written.
 */
final class Importer
{
    private const string SEPARATOR = '/';

    /** @var array<class-string<Model>, array<string, int>> model => key => id */
    private array $ids = [];

    /** @var array<class-string<Model>, list<string>> */
    private array $keys = [];

    /** @var list<string> */
    private array $problems = [];

    /** @var array<string, array<int|string, list<string>>> morph class => id => approved columns */
    private array $approved = [];

    /**
     * @param  list<Target>  $resources  every resource, so links know each model's key
     */
    public function __construct(public readonly DataFiles $files, array $resources)
    {
        foreach ($resources as $resource) {
            $this->keys[$resource->model] = $resource->key;
        }
    }

    /**
     * The lookup key of a row whose slug is unique within a parent: key($careerId, 'universitaria').
     */
    public static function key(int|string|null ...$parts): string
    {
        return implode(self::SEPARATOR, array_map(strval(...), $parts));
    }

    public function run(Target $resource): Result
    {
        $result = new Result($resource->name);
        $this->problems = [];

        try {
            DB::transaction(function () use ($resource, $result): void {
                $this->write($resource, $result);
                if ($this->problems !== []) {
                    throw new ImportFailed($this->problems);
                }
            });
        } catch (ImportFailed $failure) {
            $result->fail($failure->problems);
            unset($this->ids[$resource->model]);
        }

        return $result;
    }

    /**
     * The id of a linked row, or null (and a problem) when its key does not exist.
     *
     * @param  class-string<Model>  $model
     */
    public function id(string $model, ?string $key, string $where): ?int
    {
        if ($key === null) {
            return null;
        }
        $this->ids[$model] ??= $this->loadIds($model);
        if (! isset($this->ids[$model][$key])) {
            $this->problems[] = "{$where}: ".(new $model)->getTable()." '{$key}' does not exist";

            return null;
        }

        return $this->ids[$model][$key];
    }

    /**
     * A problem the data has (a repeated value, a missing record): the resource is rolled back.
     */
    public function problem(string $problem): void
    {
        $this->problems[] = $problem;
    }

    /**
     * @param  class-string<Model>  $model
     * @param  list<string>  $keys
     * @return list<int>
     */
    public function ids(string $model, array $keys, string $where): array
    {
        return array_values(array_filter(array_map(fn (string $key): ?int => $this->id($model, $key, $where), $keys)));
    }

    /**
     * Syncs a link table; true when a link was added, removed or changed.
     *
     * @param  BelongsToMany<covariant Model, covariant Model, covariant Pivot, 'pivot'>  $relation
     * @param  array<int, mixed>  $ids  ids, or id => pivot columns
     */
    public function sync(BelongsToMany $relation, array $ids): bool
    {
        $changes = $relation->sync($ids);

        return $changes['attached'] !== [] || $changes['detached'] !== [] || $changes['updated'] !== [];
    }

    private function write(Target $resource, Result $result): void
    {
        $existing = [];
        foreach ($this->query($resource->model)->get() as $model) {
            $existing[$this->rowKey($resource->key, $model->getAttributes())] = $model;
        }

        $seen = [];
        $problems = 0;
        foreach (($resource->rows)($this) as $row) {
            $result->read++;
            if (count($this->problems) > $problems) {
                $problems = count($this->problems);

                continue;
            }

            $model = new $resource->model;
            $values = $this->raw($model, $row->values);
            $key = $this->rowKey($resource->key, $values);
            if (isset($seen[$key])) {
                $this->problems[] = "{$resource->name}: '{$key}' appears twice";
                $problems++;

                continue;
            }
            $seen[$key] = true;

            $created = ! isset($existing[$key]);
            $changed = $created
                ? $this->create($model, $this->raw($model, $row->onCreate) + $values)
                : $this->update($existing[$key], $values);
            $model = $created ? $model : $existing[$key];
            $linked = $row->links !== null && ($row->links)($model);
            $problems = count($this->problems);

            if ($created) {
                $result->created++;
            } elseif ($changed || $linked) {
                $result->updated++;
            }
            if (isset($this->ids[$resource->model])) {
                $this->ids[$resource->model][$key] = self::id_($model);
            }
        }
    }

    /**
     * The columns of this row that an approved revision set (plus the source columns it updated).
     *
     * @return list<string>
     */
    private function approvedColumns(Model $model): array
    {
        $type = $model->getMorphClass();
        if (! isset($this->approved[$type])) {
            $this->approved[$type] = [];
            $rows = Revision::query()->where('revisable_type', $type)->where('status', RevisionStatus::Approved->value)->get(['revisable_id', 'changes']);
            foreach ($rows as $revision) {
                $columns = [...($this->approved[$type][$revision->revisable_id] ?? []), ...array_keys($revision->changes), 'sources', 'source_url', 'source_checked_at'];
                $this->approved[$type][(int) $revision->revisable_id] = array_values(array_unique($columns));
            }
        }
        $key = $model->getKey();

        return is_int($key) || is_string($key) ? ($this->approved[$type][$key] ?? []) : [];
    }

    /**
     * @param  array<string, mixed>  $values
     */
    private function create(Model $model, array $values): bool
    {
        $model->setRawAttributes($values);

        return $model->save();
    }

    /**
     * @param  array<string, mixed>  $values
     */
    private function update(Model $model, array $values): bool
    {
        // A field a reviewer approved in the panel (docs/ia.md) now belongs to the database: the frontend's export
        // still has the old value and would undo the approval on every deploy.
        $locked = $this->approvedColumns($model);
        $changed = array_filter(
            $values,
            fn (mixed $value, string $column): bool => ! in_array($column, $locked, true) && ! $this->same($model, $column, $value),
            ARRAY_FILTER_USE_BOTH,
        );
        if ($changed === []) {
            return false;
        }
        $model->setRawAttributes(array_merge($model->getAttributes(), $changed));

        return $model->save();
    }

    /**
     * The values as the database stores them: JSON text, 1/0, enum values.
     *
     * @param  array<string, mixed>  $values
     * @return array<string, mixed>
     */
    private function raw(Model $model, array $values): array
    {
        $raw = [];
        foreach ($values as $column => $value) {
            $translatable = method_exists($model, 'isTranslatableAttribute') && $model->isTranslatableAttribute($column);
            if ($translatable && $value !== null && ! $value instanceof Translations) {
                throw new LogicException("{$column} is translatable: give it Record::t()");
            }
            $value = $value instanceof Translations ? $value->stored() : $value;
            $raw[$column] = match (true) {
                $value === null => null,
                $value instanceof BackedEnum => $value->value,
                is_bool($value) => (int) $value,
                is_array($value) => json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR),
                default => $value,
            };
        }

        return $raw;
    }

    /**
     * Equal as data: JSON with the same content in any key order (MySQL reorders keys), numbers by value.
     */
    private function same(Model $model, string $column, mixed $value): bool
    {
        $original = $model->getRawOriginal($column);
        if ($original === null || $value === null) {
            return $original === $value;
        }
        if ($model->hasCast($column, ['array', 'json']) && is_string($original) && is_string($value)) {
            return $this->canonical(json_decode($original, true)) === $this->canonical(json_decode($value, true));
        }
        if (is_numeric($original) && is_numeric($value)) {
            return (float) $original === (float) $value;
        }

        return is_scalar($original) && is_scalar($value) && (string) $original === (string) $value;
    }

    private static function id_(Model $model): int
    {
        $id = $model->getKey();

        return is_numeric($id) ? (int) $id : throw new LogicException($model::class.' has no numeric id');
    }

    private function canonical(mixed $value): mixed
    {
        if (! is_array($value)) {
            return $value;
        }
        $value = array_map($this->canonical(...), $value);
        if (! array_is_list($value)) {
            ksort($value);
        }

        return $value;
    }

    /**
     * @param  list<string>  $columns
     * @param  array<string, mixed>  $values
     */
    private function rowKey(array $columns, array $values): string
    {
        return self::key(...array_map(function (string $column) use ($values): string {
            $value = $values[$column] ?? null;

            return is_scalar($value) ? (string) $value : '';
        }, $columns));
    }

    /**
     * @param  class-string<Model>  $model
     * @return array<string, int>
     */
    private function loadIds(string $model): array
    {
        $columns = $this->keys[$model] ?? ['slug'];
        $ids = [];
        foreach ($this->query($model)->get(['id', ...$columns]) as $row) {
            $ids[$this->rowKey($columns, $row->getAttributes())] = self::id_($row);
        }

        return $ids;
    }

    /**
     * Soft-deleted rows count as existing: the import never duplicates a row someone deleted in the panel.
     *
     * @template TModel of Model
     *
     * @param  class-string<TModel>  $model
     * @return Builder<TModel>
     */
    private function query(string $model): Builder
    {
        $query = $model::query();

        return in_array(SoftDeletes::class, class_uses_recursive($model), true)
            ? $query->withoutGlobalScope(SoftDeletingScope::class)
            : $query;
    }
}
