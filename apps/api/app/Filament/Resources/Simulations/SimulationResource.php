<?php

namespace App\Filament\Resources\Simulations;

use App\Filament\Content\ContentResource;
use App\Filament\Resources\Simulations\Pages\CreateSimulation;
use App\Filament\Resources\Simulations\Pages\EditSimulation;
use App\Filament\Resources\Simulations\Pages\ListSimulations;
use App\Models\Simulation;
use BackedEnum;
use Filament\Support\Icons\Heroicon;
use Illuminate\Database\Eloquent\Model;
use UnitEnum;

/**
 * Work simulations by area.
 */
class SimulationResource extends ContentResource
{
    protected static ?string $model = Simulation::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::PlayCircle;

    protected static string|UnitEnum|null $navigationGroup = 'Carreiras';

    protected static ?int $navigationSort = 12;

    protected static ?string $modelLabel = 'simulação de trabalho';

    protected static ?string $pluralModelLabel = 'simulações de trabalho';

    protected static ?string $areaRelation = 'career.group.area';

    protected static array $tableColumns = ['minutes'];

    public static function previewPath(Model $record): ?string
    {
        return '/simulacoes/'.static::slugOf($record);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListSimulations::route('/'),
            'create' => CreateSimulation::route('/create'),
            'edit' => EditSimulation::route('/{record}/edit'),
        ];
    }
}
