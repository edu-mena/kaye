<?php

namespace App\Filament\Content\RelationManagers;

use App\Filament\Content\ContentForm;
use App\Filament\Content\ContentResource;
use App\Filament\Content\ContentSaver;
use App\Filament\Content\ContentTable;
use Filament\Actions\CreateAction;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Schema;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOneOrMany;

/**
 * The rows that belong to the one being edited (the offers and fees of an institution, the pathways of a career),
 * edited in place with the same form and list as their own resource; the parent's key is implied.
 */
abstract class ChildrenRelationManager extends RelationManager
{
    /** @var class-string<ContentResource> The resource of the child rows. */
    protected static string $childResource;

    public function form(Schema $schema): Schema
    {
        return ContentForm::configure($schema, static::$childResource::getModel());
    }

    public function table(Table $table): Table
    {
        return ContentTable::configure($table, static::$childResource)
            ->recordTitle(fn (Model $record): string => static::$childResource::getRecordTitle($record))
            ->headerActions([
                CreateAction::make()->using(fn (array $data): Model => ContentSaver::save($this->newChild(), ContentForm::state($data))),
            ])
            ->recordActions([
                EditAction::make()
                    ->mutateRecordDataUsing(fn (Model $record, array $data): array => ContentForm::fill($record, ContentForm::state($data)))
                    ->using(fn (Model $record, array $data): Model => ContentSaver::save($record, ContentForm::state($data))),
                ContentTable::preview(static::$childResource),
                DeleteAction::make(),
            ]);
    }

    public static function getTitle(Model $ownerRecord, string $pageClass): string
    {
        return ucfirst(static::$childResource::getPluralModelLabel());
    }

    /** A new row already pointing to its parent. */
    private function newChild(): Model
    {
        $relation = $this->getRelationship();
        if ($relation instanceof HasOneOrMany) {
            return $relation->make();
        }
        $model = static::$childResource::getModel();

        return new $model;
    }
}
