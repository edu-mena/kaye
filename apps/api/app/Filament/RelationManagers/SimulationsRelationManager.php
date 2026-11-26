<?php

namespace App\Filament\RelationManagers;

use App\Filament\Content\RelationManagers\ChildrenRelationManager;
use App\Filament\Resources\Simulations\SimulationResource;

class SimulationsRelationManager extends ChildrenRelationManager
{
    protected static string $relationship = 'simulations';

    protected static string $childResource = SimulationResource::class;
}
