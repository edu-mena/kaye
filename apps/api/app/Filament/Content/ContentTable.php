<?php

namespace App\Filament\Content;

use App\Enums\ContentStatus;
use App\Filament\Actions\ResearchWithAi;
use App\Models\Area;
use App\Models\User;
use App\Support\ContentTypes;
use App\Support\PanelEdits;
use Filament\Actions\Action;
use Filament\Actions\ActionGroup;
use Filament\Actions\BulkAction;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\RestoreBulkAction;
use Filament\Notifications\Notification;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\BaseFilter;
use Filament\Tables\Filters\Filter;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Filters\TrashedFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

/**
 * The list of every catalogue table: the name, the state, the source and when it changed; the filters the team
 * asked for (area, province, state, estimated, without a source); publishing and "reviewed" for many rows at once;
 * and "Ver na app". Built from the columns, like the form (ContentForm).
 */
final class ContentTable
{
    /**
     * @param  class-string<ContentResource>  $resource
     */
    public static function configure(Table $table, string $resource): Table
    {
        $model = $resource::getModel();
        $title = ContentLabels::titleColumn($model);

        return $table
            ->defaultSort(ContentColumns::has($model, 'position') ? 'position' : 'id')
            ->columns(self::columns($resource, $model, $title))
            ->filters(self::filters($resource, $model))
            ->recordActions([
                EditAction::make(),
                ActionGroup::make(($type = ContentTypes::ofModel($model)) === null
                    ? [self::preview($resource)]
                    : [self::preview($resource), ResearchWithAi::make($type)]),
            ])
            ->toolbarActions([BulkActionGroup::make(self::bulkActions($model))]);
    }

    /** "Ver na app": the row's page in the app, in a new tab. Only published rows show there. */
    public static function preview(string $resource): Action
    {
        /** @var class-string<ContentResource> $resource */
        return Action::make('preview')
            ->label('Ver na app')
            ->icon(Heroicon::ArrowTopRightOnSquare)
            ->tooltip('A app só mostra o que está publicado.')
            ->url(fn (Model $record): ?string => ($path = $resource::previewPath($record)) === null ? null : url($path), shouldOpenInNewTab: true)
            ->visible(fn (Model $record): bool => $resource::previewPath($record) !== null);
    }

    /**
     * @param  class-string<ContentResource>  $resource
     * @param  class-string<Model>  $model
     * @return list<\Filament\Tables\Columns\Column>
     */
    private static function columns(string $resource, string $model, string $title): array
    {
        $columns = [
            TextColumn::make($title)
                ->label(ContentLabels::column($title))
                ->state(fn (Model $record): string => ContentLabels::of($record))
                ->description(fn (Model $record): ?string => $title !== 'slug' && is_string($slug = $record->getAttribute('slug')) ? $slug : null)
                ->searchable(query: fn (Builder $query, string $search): Builder => self::search($query, $model, $title, $search))
                ->wrap(),
        ];
        foreach ($resource::tableColumns() as $name) {
            $columns[] = TextColumn::make($name)->label(ContentLabels::column($name))->toggleable()->wrap();
        }
        if (ContentColumns::has($model, 'status')) {
            $columns[] = TextColumn::make('status')->label('Estado')->badge()
                ->formatStateUsing(fn (ContentStatus|string|null $state): string => ContentLabels::status($state))
                ->color(fn (ContentStatus|string|null $state): string => match ($state instanceof ContentStatus ? $state->value : $state) {
                    'published' => 'success',
                    'review' => 'warning',
                    default => 'gray',
                });
        }
        if (ContentColumns::has($model, 'estimated')) {
            $columns[] = IconColumn::make('estimated')->label('Estimado')->boolean()->toggleable();
        }
        if (ContentColumns::has($model, 'source_url')) {
            $columns[] = IconColumn::make('has_source')->label('Fonte')
                ->state(fn (Model $record): bool => filled($record->getAttribute('source_url')))
                ->boolean()->toggleable();
        }
        $columns[] = TextColumn::make('updated_at')->label('Atualizado')->since()->sortable()->toggleable();

        return $columns;
    }

    /**
     * @param  Builder<Model>  $query
     * @param  class-string<Model>  $model
     * @return Builder<Model>
     */
    private static function search(Builder $query, string $model, string $title, string $search): Builder
    {
        return $query->where(function (Builder $where) use ($model, $title, $search): void {
            $where->where($title, 'like', "%{$search}%");
            if ($title !== 'slug' && ContentColumns::has($model, 'slug')) {
                $where->orWhere('slug', 'like', "%{$search}%");
            }
        });
    }

    /**
     * @param  class-string<ContentResource>  $resource
     * @param  class-string<Model>  $model
     * @return list<BaseFilter>
     */
    private static function filters(string $resource, string $model): array
    {
        $filters = [];
        if (($area = self::areaFilter($resource, $model)) !== null) {
            $filters[] = $area;
        }
        if (ContentColumns::has($model, 'province')) {
            $filters[] = SelectFilter::make('province')->label('Província')->options(
                fn (): array => $model::query()->withoutGlobalScopes()->whereNotNull('province')->distinct()->orderBy('province')->pluck('province', 'province')->all(),
            );
        }
        if (ContentColumns::has($model, 'status')) {
            $filters[] = SelectFilter::make('status')->label('Estado')->options(ContentForm::STATUSES);
        }
        if (ContentColumns::has($model, 'estimated')) {
            $filters[] = TernaryFilter::make('estimated')->label('Estimado');
        }
        if (ContentColumns::has($model, 'source_url')) {
            $filters[] = Filter::make('without_source')->label('Sem fonte')->toggle()
                ->query(fn (Builder $query): Builder => $query->where(fn (Builder $where): Builder => $where->whereNull('source_url')->orWhere('source_url', '')));
        }
        if (ContentColumns::softDeletes($model)) {
            $filters[] = TrashedFilter::make()->label('Apagados');
        }

        return $filters;
    }

    /**
     * The area of the catalogue (Saúde, Tecnologia…): a column `area`, a JSON list `areas`, or the relation the
     * resource names (a career through its group, a piece of news through its areas).
     *
     * @param  class-string<ContentResource>  $resource
     * @param  class-string<Model>  $model
     */
    private static function areaFilter(string $resource, string $model): ?SelectFilter
    {
        $relation = $resource::areaRelation();
        $hasColumn = ContentColumns::has($model, 'area');
        $hasList = ContentColumns::has($model, 'areas');
        if ($relation === null && ! $hasColumn && ! $hasList) {
            return null;
        }

        return SelectFilter::make('area')
            ->label('Área')
            ->options(fn (): array => Area::query()->orderBy('position')->get()->mapWithKeys(fn (Area $area): array => [$area->slug => ContentLabels::of($area)])->all())
            ->query(function (Builder $query, array $data) use ($relation, $hasColumn): Builder {
                $area = $data['value'] ?? null;
                if (! is_string($area) || $area === '') {
                    return $query;
                }

                return match (true) {
                    $relation !== null => $query->whereHas($relation, fn (Builder $areas): Builder => $areas->where('slug', $area)),
                    $hasColumn => $query->where('area', $area),
                    default => $query->whereJsonContains('areas', $area),
                };
            });
    }

    /**
     * @param  class-string<Model>  $model
     * @return list<BulkAction>
     */
    private static function bulkActions(string $model): array
    {
        $actions = [];
        if (ContentColumns::has($model, 'status')) {
            $actions[] = self::bulkChange('publish', 'Publicar', Heroicon::Eye, 'publish', $model, ['status' => ContentStatus::Published->value]);
            $actions[] = self::bulkChange('unpublish', 'Voltar a rascunho', Heroicon::EyeSlash, 'publish', $model, ['status' => ContentStatus::Draft->value]);
        }
        if (ContentColumns::has($model, 'source_checked_at')) {
            $actions[] = self::bulkChange('reviewed', 'Marcar revisto (hoje)', Heroicon::CheckBadge, 'update', $model, ['source_checked_at' => now()->toDateString()]);
        }
        $actions[] = DeleteBulkAction::make();
        if (ContentColumns::softDeletes($model)) {
            $actions[] = RestoreBulkAction::make();
        }

        return $actions;
    }

    /**
     * A change to many rows at once, allowed by the policy's `$ability`; kept in each row's history.
     *
     * @param  class-string<Model>  $model
     * @param  array<string, mixed>  $values
     */
    private static function bulkChange(string $name, string $label, Heroicon $icon, string $ability, string $model, array $values): BulkAction
    {
        return BulkAction::make($name)
            ->label($label)
            ->icon($icon)
            ->requiresConfirmation()
            ->authorize(fn (): bool => Auth::user()?->can($ability, new $model) ?? false)
            ->action(function (Collection $records) use ($values, $label): void {
                $user = Auth::user();
                if (! $user instanceof User) {
                    return;
                }
                $edits = app(PanelEdits::class);
                foreach ($records as $record) {
                    $record->fill($values);
                    $before = $edits->before($record);
                    $record->save();
                    $edits->record($record, $before, $user);
                }
                Notification::make()->title($label.': '.$records->count().' registos.')->success()->send();
            })
            ->deselectRecordsAfterCompletion();
    }
}
