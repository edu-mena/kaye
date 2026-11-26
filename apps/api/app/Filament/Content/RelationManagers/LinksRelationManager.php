<?php

namespace App\Filament\Content\RelationManagers;

use App\Filament\Content\ContentLabels;
use App\Models\User;
use App\Support\PanelEdits;
use App\Support\PublicContent;
use Filament\Actions\AttachAction;
use Filament\Actions\DetachAction;
use Filament\Actions\DetachBulkAction;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Support\Facades\Auth;

/**
 * A link table edited from the side the importer writes (the careers of a company, the skills of a career): add
 * or take out links. Link tables change without model events, so each change clears the public API's cache, and
 * the whole list is kept in the history so `kaye:import` no longer rewrites it (ADR 0028).
 */
abstract class LinksRelationManager extends RelationManager
{
    public function table(Table $table): Table
    {
        $relation = $this->getRelationship();
        $related = $relation instanceof Relation ? $relation->getRelated() : $relation->getModel();
        $title = ContentLabels::titleColumn($related::class);
        $searchable = array_values(array_unique([$title, 'slug']));

        return $table
            ->recordTitle(fn (Model $record): string => ContentLabels::of($record))
            ->columns([
                TextColumn::make($title)->label('Nome')->state(fn (Model $record): string => ContentLabels::of($record))
                    ->searchable(query: fn (Builder $query, string $search): Builder => $query->where(
                        fn (Builder $where): Builder => $where->where($related->qualifyColumn($title), 'like', "%{$search}%")
                            ->orWhere($related->qualifyColumn('slug'), 'like', "%{$search}%"),
                    )),
                TextColumn::make('slug')->label('Identificador'),
            ])
            ->headerActions([
                AttachAction::make()
                    ->label('Ligar')
                    ->recordSelectSearchColumns($searchable)
                    ->recordSelectOptionsQuery(fn (Builder $query): Builder => $query->orderBy($related->qualifyColumn('slug')))
                    ->authorize(fn (): bool => $this->canChange())
                    ->after(fn () => $this->changed()),
            ])
            ->recordActions([
                DetachAction::make()->label('Desligar')->authorize(fn (): bool => $this->canChange())->after(fn () => $this->changed()),
            ])
            ->toolbarActions([
                DetachBulkAction::make()->label('Desligar')->authorize(fn (): bool => $this->canChange())->after(fn () => $this->changed()),
            ]);
    }

    private function canChange(): bool
    {
        return Auth::user()?->can('update', $this->getOwnerRecord()) ?? false;
    }

    private function changed(): void
    {
        PublicContent::flush();
        $user = Auth::user();
        if ($user instanceof User) {
            app(PanelEdits::class)->relation($this->getOwnerRecord(), static::getRelationshipName(), $user);
        }
    }
}
