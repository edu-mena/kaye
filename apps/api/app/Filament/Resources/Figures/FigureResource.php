<?php

namespace App\Filament\Resources\Figures;

use App\Filament\Content\ContentResource;
use App\Filament\RelationManagers\LinkedCareersRelationManager;
use App\Filament\Resources\Figures\Pages\CreateFigure;
use App\Filament\Resources\Figures\Pages\EditFigure;
use App\Filament\Resources\Figures\Pages\ListFigures;
use App\Models\Figure;
use BackedEnum;
use Filament\Support\Icons\Heroicon;
use UnitEnum;

/**
 * Public figures of a career, with the source.
 */
class FigureResource extends ContentResource
{
    protected static ?string $model = Figure::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::Star;

    protected static string|UnitEnum|null $navigationGroup = 'Carreiras';

    protected static ?int $navigationSort = 10;

    protected static ?string $modelLabel = 'figura de referência';

    protected static ?string $pluralModelLabel = 'figuras de referência';

    public static function getRelations(): array
    {
        return [
            LinkedCareersRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListFigures::route('/'),
            'create' => CreateFigure::route('/create'),
            'edit' => EditFigure::route('/{record}/edit'),
        ];
    }
}
