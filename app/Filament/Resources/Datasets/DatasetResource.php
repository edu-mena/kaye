<?php

namespace App\Filament\Resources\Datasets;

use App\Filament\Content\ContentResource;
use App\Filament\Resources\Datasets\Pages\CreateDataset;
use App\Filament\Resources\Datasets\Pages\EditDataset;
use App\Filament\Resources\Datasets\Pages\ListDatasets;
use App\Models\Dataset;
use BackedEnum;
use Filament\Support\Icons\Heroicon;
use Illuminate\Database\Eloquent\Model;
use UnitEnum;

/**
 * The Mercado numbers and the fixed lists (provinces, psychotechnical lists), one document each.
 */
class DatasetResource extends ContentResource
{
    protected static ?string $model = Dataset::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::CircleStack;

    protected static string|UnitEnum|null $navigationGroup = 'Mercado';

    protected static ?int $navigationSort = 1;

    protected static ?string $modelLabel = 'dados do Mercado';

    protected static ?string $pluralModelLabel = 'dados do Mercado';

    protected static array $tableColumns = ['computed_at'];

    public static function previewPath(Model $record): ?string
    {
        return '/mercado';
    }

    public static function getPages(): array
    {
        return [
            'index' => ListDatasets::route('/'),
            'create' => CreateDataset::route('/create'),
            'edit' => EditDataset::route('/{record}/edit'),
        ];
    }
}
