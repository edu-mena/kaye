<?php

namespace App\Filament\Resources\Pathways;

use App\Filament\Content\ContentResource;
use App\Filament\Resources\Pathways\Pages\CreatePathway;
use App\Filament\Resources\Pathways\Pages\EditPathway;
use App\Filament\Resources\Pathways\Pages\ListPathways;
use App\Models\Pathway;
use BackedEnum;
use Filament\Support\Icons\Heroicon;
use Illuminate\Database\Eloquent\Model;
use UnitEnum;

/**
 * The ways to reach a career, with their steps and costs.
 */
class PathwayResource extends ContentResource
{
    protected static ?string $model = Pathway::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::Map;

    protected static string|UnitEnum|null $navigationGroup = 'Carreiras';

    protected static ?int $navigationSort = 4;

    protected static ?string $modelLabel = 'caminho';

    protected static ?string $pluralModelLabel = 'caminhos';

    protected static ?string $areaRelation = 'career.group.area';

    public static function previewPath(Model $record): ?string
    {
        return '/carreiras/'.static::slugOf($record->getRelationValue('career'));
    }

    public static function getPages(): array
    {
        return [
            'index' => ListPathways::route('/'),
            'create' => CreatePathway::route('/create'),
            'edit' => EditPathway::route('/{record}/edit'),
        ];
    }
}
