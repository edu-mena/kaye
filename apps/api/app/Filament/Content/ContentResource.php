<?php

namespace App\Filament\Content;

use App\Providers\Filament\AdminPanelProvider;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletingScope;

/**
 * A catalogue table in the panel (docs/design.md, "Painel"). The form and the list come from the table's columns
 * (ContentForm, ContentTable), with the fields every content table shares: status, source, estimated and the
 * translations in pt, en and fr, each in its tab. A resource only says what is particular to it: its labels, where
 * it shows in the app, how it reaches an area and the relations edited inside it.
 *
 * The policies decide who sees and changes it (ContentPolicy: editors write, reviewers publish, admins delete).
 */
abstract class ContentResource extends Resource
{
    /** The relation (dot path) from a row to its Area, for the area filter; null: a column `area` or `areas`. */
    protected static ?string $areaRelation = null;

    /** @var list<string> Columns shown in the list besides the name, the state and the source. */
    protected static array $tableColumns = [];

    /**
     * Every catalogue resource of the panel.
     *
     * @return list<class-string<ContentResource>>
     */
    public static function all(): array
    {
        $resources = [];
        foreach (AdminPanelProvider::adminPanel()->getResources() as $resource) {
            if (is_subclass_of($resource, self::class)) {
                $resources[] = $resource;
            }
        }

        return $resources;
    }

    /** The row's page in the app ("Ver na app"); null: the app has no page for it. */
    public static function previewPath(Model $record): ?string
    {
        return null;
    }

    public static function areaRelation(): ?string
    {
        return static::$areaRelation;
    }

    /**
     * @return list<string>
     */
    public static function tableColumns(): array
    {
        return static::$tableColumns;
    }

    public static function form(Schema $schema): Schema
    {
        return ContentForm::configure($schema, static::getModel());
    }

    public static function table(Table $table): Table
    {
        return ContentTable::configure($table, static::class);
    }

    public static function getRecordTitle(?Model $record): string
    {
        return $record === null ? static::getModelLabel() : ContentLabels::of($record);
    }

    /**
     * @return Builder<Model>
     */
    public static function getEloquentQuery(): Builder
    {
        $query = parent::getEloquentQuery();

        return ContentColumns::softDeletes(static::getModel()) ? $query->withoutGlobalScopes([SoftDeletingScope::class]) : $query;
    }

    /**
     * @return list<string>
     */
    public static function getGloballySearchableAttributes(): array
    {
        return ContentColumns::has(static::getModel(), 'slug') ? ['slug'] : [];
    }

    /** Short helper for previewPath(): a path with the row's slug (or a parent's). */
    protected static function slugOf(mixed $record): string
    {
        $slug = $record instanceof Model ? $record->getAttribute('slug') : null;

        return is_string($slug) ? rawurlencode($slug) : '';
    }
}
