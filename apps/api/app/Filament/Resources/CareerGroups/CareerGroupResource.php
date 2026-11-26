<?php

namespace App\Filament\Resources\CareerGroups;

use App\Filament\Content\ContentResource;
use App\Filament\RelationManagers\GroupCareersRelationManager;
use App\Filament\Resources\CareerGroups\Pages\CreateCareerGroup;
use App\Filament\Resources\CareerGroups\Pages\EditCareerGroup;
use App\Filament\Resources\CareerGroups\Pages\ListCareerGroups;
use App\Models\CareerGroup;
use BackedEnum;
use Filament\Support\Icons\Heroicon;
use Illuminate\Database\Eloquent\Model;
use UnitEnum;

/**
 * The groups of careers inside an area (Medicina, Enfermagem…).
 */
class CareerGroupResource extends ContentResource
{
    protected static ?string $model = CareerGroup::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::RectangleGroup;

    protected static string|UnitEnum|null $navigationGroup = 'Carreiras';

    protected static ?int $navigationSort = 2;

    protected static ?string $modelLabel = 'grupo de carreiras';

    protected static ?string $pluralModelLabel = 'grupos de carreiras';

    protected static ?string $areaRelation = 'area';

    public static function previewPath(Model $record): ?string
    {
        return '/carreiras?area='.static::slugOf($record);
    }

    public static function getRelations(): array
    {
        return [
            GroupCareersRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListCareerGroups::route('/'),
            'create' => CreateCareerGroup::route('/create'),
            'edit' => EditCareerGroup::route('/{record}/edit'),
        ];
    }
}
