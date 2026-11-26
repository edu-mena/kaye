<?php

namespace App\Filament\RelationManagers;

use App\Filament\Content\RelationManagers\ChildrenRelationManager;
use App\Filament\Resources\KursoUnits\KursoUnitResource;

class KursoUnitsRelationManager extends ChildrenRelationManager
{
    protected static string $relationship = 'units';

    protected static string $childResource = KursoUnitResource::class;
}
