<?php

namespace App\Filament\Resources\AiTasks;

use App\Filament\Resources\AiTasks\Pages\ListAiTasks;
use App\Models\AiTask;
use App\Support\ContentTypes;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use UnitEnum;

/**
 * "Pesquisar com IA" (docs/ia.md): each research asked, its state, what it cost and what it proposed. A new one is
 * asked with the button on the list page (and, with the content resources of the panel, on each row).
 *
 * @extends resource<AiTask>
 */
class AiTaskResource extends Resource
{
    protected static ?string $model = AiTask::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::Sparkles;

    protected static ?string $modelLabel = 'pesquisa com IA';

    protected static ?string $pluralModelLabel = 'pesquisas com IA';

    protected static ?string $navigationLabel = 'Pesquisas';

    protected static string|UnitEnum|null $navigationGroup = 'Caixa da IA';

    protected static ?int $navigationSort = 2;

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('id', 'desc')
            ->columns([
                TextColumn::make('created_at')->label('Data')->dateTime('d/m/Y H:i')->sortable(),
                TextColumn::make('content_type')->label('Tipo')->formatStateUsing(fn (string $state): string => ContentTypes::exists($state) ? ContentTypes::label($state) : $state),
                TextColumn::make('target_slug')->label('Registo')->placeholder('todos'),
                TextColumn::make('prompt')->label('Pedido')->limit(60)->wrap(),
                TextColumn::make('status')->label('Estado')->badge(),
                TextColumn::make('revisions_count')->label('Propostas')->counts('revisions'),
                TextColumn::make('cost_usd')->label('Custo (USD)')->numeric(4),
                TextColumn::make('error')->label('Nota')->limit(50)->placeholder(''),
            ]);
    }

    public static function canCreate(): bool
    {
        return false;
    }

    public static function getPages(): array
    {
        return [
            'index' => ListAiTasks::route('/'),
        ];
    }
}
