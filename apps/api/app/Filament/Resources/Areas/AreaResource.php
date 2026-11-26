<?php

namespace App\Filament\Resources\Areas;

use App\Filament\Content\ContentResource;
use App\Filament\RelationManagers\CareerGroupsRelationManager;
use App\Filament\Resources\Areas\Pages\CreateArea;
use App\Filament\Resources\Areas\Pages\EditArea;
use App\Filament\Resources\Areas\Pages\ListAreas;
use App\Models\Area;
use BackedEnum;
use Filament\Support\Icons\Heroicon;
use Illuminate\Database\Eloquent\Model;
use UnitEnum;

/**
 * The areas of the catalogue (Saúde, Tecnologia…) and their groups.
 */
class AreaResource extends ContentResource
{
    protected static ?string $model = Area::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::Squares2x2;

    protected static string|UnitEnum|null $navigationGroup = 'Carreiras';

    protected static ?int $navigationSort = 1;

    protected static ?string $modelLabel = 'área';

    protected static ?string $pluralModelLabel = 'áreas';

    public static function previewPath(Model $record): ?string
    {
        return '/areas/'.static::slugOf($record);
    }

    public static function getRelations(): array
    {
        return [
            CareerGroupsRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListAreas::route('/'),
            'create' => CreateArea::route('/create'),
            'edit' => EditArea::route('/{record}/edit'),
        ];
    }
}
