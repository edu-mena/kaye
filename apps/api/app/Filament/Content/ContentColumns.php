<?php

namespace App\Filament\Content;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Schema;
use ReflectionClass;
use ReflectionMethod;
use ReflectionNamedType;

/**
 * What the columns of a catalogue table are, read from the database and the model: what
 * `make:filament-resource --generate` reads, done once for every table, so the panel's forms and tables are built
 * from it instead of 34 copies of the same code (docs/design.md, "Painel").
 */
final class ContentColumns
{
    /** The columns every content table shares (App\Support\ContentSchema): the "Publicação" tab. */
    public const COMMON = ['slug', 'status', 'source_url', 'source_checked_at', 'estimated', 'position'];

    /** Image columns: uploaded with their origin, never typed. */
    public const IMAGES = ['logo', 'banner', 'photo', 'thumbnail', 'image'];

    /** Bookkeeping the code fills. */
    private const HIDDEN = ['id', 'created_at', 'updated_at', 'deleted_at', 'url_hash', 'title_hash', 'summary_attempts'];

    /** @var array<class-string<Model>, array<string, Column>> */
    private static array $columns = [];

    /**
     * Every editable column, in the table's order.
     *
     * @param  class-string<Model>  $class
     * @return array<string, Column>
     */
    public static function of(string $class): array
    {
        if (isset(self::$columns[$class])) {
            return self::$columns[$class];
        }
        $model = new $class;
        $relations = self::belongsTo($model);
        $translatable = property_exists($model, 'translatable') && is_array($model->translatable) ? $model->translatable : [];

        $columns = [];
        foreach (Schema::getColumns($model->getTable()) as $column) {
            $name = $column['name'];
            if (in_array($name, self::HIDDEN, true)) {
                continue;
            }
            $type = strtolower($column['type_name']);
            $full = strtolower($column['type']);
            $kind = match (true) {
                in_array($name, self::IMAGES, true) => $model->hasCast($name, ['array', 'json']) ? Column::PHOTO : Column::IMAGE,
                in_array($name, $translatable, true) => Column::TRANSLATABLE,
                $model->hasCast($name, ['array', 'json', 'object', 'collection', 'encrypted:array']) || $type === 'json' => Column::JSON,
                $model->hasCast($name, ['boolean', 'bool']) || str_starts_with($full, 'tinyint(1)') => Column::BOOLEAN,
                isset($relations[$name]) => Column::BELONGS_TO,
                $type === 'date' => Column::DATE,
                in_array($type, ['timestamp', 'datetime'], true) => Column::DATETIME,
                in_array($type, ['tinyint', 'smallint', 'mediumint', 'int', 'integer', 'bigint'], true) => Column::INTEGER,
                in_array($type, ['decimal', 'float', 'double'], true) => Column::DECIMAL,
                in_array($type, ['varchar', 'char'], true) => Column::STRING,
                default => Column::TEXT,
            };
            $columns[$name] = new Column(
                name: $name,
                kind: $kind,
                nullable: $column['nullable'],
                default: self::defaultOf($column['default']),
                length: preg_match('/\((\d+)\)/', $full, $match) === 1 ? (int) $match[1] : null,
                relation: $relations[$name] ?? null,
                unsigned: str_contains($full, 'unsigned'),
            );
        }

        return self::$columns[$class] = $columns;
    }

    /** A column's default as the database reports it: MariaDB says `NULL` for none and quotes the strings. */
    private static function defaultOf(mixed $default): ?string
    {
        if (! is_string($default) || strtoupper($default) === 'NULL') {
            return null;
        }

        return preg_match("/^'(.*)'$/s", $default, $match) === 1 ? str_replace("''", "'", $match[1]) : $default;
    }

    /**
     * @param  class-string<Model>  $class
     */
    public static function has(string $class, string $column): bool
    {
        return isset(self::of($class)[$column]);
    }

    /**
     * The slug is unique in the whole table (not only within a parent, as in pathways or kurso_units).
     *
     * @param  class-string<Model>  $class
     */
    public static function uniqueSlug(string $class): bool
    {
        foreach (Schema::getIndexes((new $class)->getTable()) as $index) {
            if ($index['unique'] && $index['columns'] === ['slug']) {
                return true;
            }
        }

        return false;
    }

    /**
     * Deleted rows can be brought back (soft delete).
     *
     * @param  class-string<Model>  $class
     */
    public static function softDeletes(string $class): bool
    {
        return in_array(SoftDeletes::class, class_uses_recursive($class), true);
    }

    /**
     * The parent rows a model points to: foreign key => relation name.
     *
     * @return array<string, string>
     */
    private static function belongsTo(Model $model): array
    {
        $relations = [];
        foreach ((new ReflectionClass($model))->getMethods(ReflectionMethod::IS_PUBLIC) as $method) {
            $type = $method->getReturnType();
            if ($method->getNumberOfParameters() > 0 || ! $type instanceof ReflectionNamedType || $type->getName() !== BelongsTo::class) {
                continue;
            }
            $relation = $model->{$method->getName()}();
            if ($relation instanceof BelongsTo) {
                $relations[$relation->getForeignKeyName()] = $method->getName();
            }
        }

        return $relations;
    }
}
