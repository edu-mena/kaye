<?php

namespace App\Filament\Resources\Feedback;

use App\Filament\Resources\Feedback\Pages\ListFeedback;
use App\Models\Feedback;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Model;

/**
 * The critiques, ideas and bugs sent from the site, to read and download.
 *
 * @extends resource<Feedback>
 */
class FeedbackResource extends Resource
{
    protected static ?string $model = Feedback::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::ChatBubbleLeftRight;

    protected static ?string $modelLabel = 'crítica';

    protected static ?string $pluralModelLabel = 'críticas e ideias';

    protected static ?string $navigationLabel = 'Críticas e ideias';

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('created_at', 'desc')
            ->columns([
                TextColumn::make('created_at')->label('Data')->dateTime('d/m/Y H:i')->sortable(),
                TextColumn::make('kind')->label('Tipo')->badge(),
                TextColumn::make('message')->label('Mensagem')->wrap()->searchable(),
                TextColumn::make('page')->label('Página'),
                TextColumn::make('locale')->label('Língua'),
            ]);
    }

    public static function canCreate(): bool
    {
        return false;
    }

    public static function canEdit(Model $record): bool
    {
        return false;
    }

    public static function getPages(): array
    {
        return [
            'index' => ListFeedback::route('/'),
        ];
    }
}
