<?php

namespace App\Filament\Resources\NewsEvents;

use App\Filament\Content\ContentResource;
use App\Filament\Resources\NewsEvents\Pages\CreateNewsEvent;
use App\Filament\Resources\NewsEvents\Pages\EditNewsEvent;
use App\Filament\Resources\NewsEvents\Pages\ListNewsEvents;
use App\Models\NewsEvent;
use BackedEnum;
use Filament\Support\Icons\Heroicon;
use Illuminate\Database\Eloquent\Model;
use UnitEnum;

/**
 * The event of a piece of news: date, place, registration.
 */
class NewsEventResource extends ContentResource
{
    protected static ?string $model = NewsEvent::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::Calendar;

    protected static string|UnitEnum|null $navigationGroup = 'Novidades';

    protected static ?int $navigationSort = 2;

    protected static ?string $modelLabel = 'evento';

    protected static ?string $pluralModelLabel = 'eventos';

    protected static array $tableColumns = ['starts_on', 'city'];

    public static function previewPath(Model $record): ?string
    {
        return '/novidades/'.static::slugOf($record->getRelationValue('news'));
    }

    public static function getPages(): array
    {
        return [
            'index' => ListNewsEvents::route('/'),
            'create' => CreateNewsEvent::route('/create'),
            'edit' => EditNewsEvent::route('/{record}/edit'),
        ];
    }
}
