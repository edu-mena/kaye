<?php

namespace App\Filament\Resources\Agents;

use App\Filament\Content\ContentResource;
use App\Filament\RelationManagers\SimulationsRelationManager;
use App\Filament\Resources\Agents\Pages\CreateAgent;
use App\Filament\Resources\Agents\Pages\EditAgent;
use App\Filament\Resources\Agents\Pages\ListAgents;
use App\Models\Agent;
use BackedEnum;
use Filament\Support\Icons\Heroicon;
use Illuminate\Database\Eloquent\Model;
use UnitEnum;

/**
 * The professionals who review the work simulations.
 */
class AgentResource extends ContentResource
{
    protected static ?string $model = Agent::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::Identification;

    protected static string|UnitEnum|null $navigationGroup = 'Carreiras';

    protected static ?int $navigationSort = 11;

    protected static ?string $modelLabel = 'agente do Kayé';

    protected static ?string $pluralModelLabel = 'agentes do Kayé';

    protected static array $tableColumns = ['role', 'area'];

    public static function previewPath(Model $record): ?string
    {
        return '/agentes/'.static::slugOf($record);
    }

    public static function getRelations(): array
    {
        return [
            SimulationsRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListAgents::route('/'),
            'create' => CreateAgent::route('/create'),
            'edit' => EditAgent::route('/{record}/edit'),
        ];
    }
}
