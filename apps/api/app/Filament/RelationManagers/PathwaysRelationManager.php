<?php

namespace App\Filament\RelationManagers;

use App\Filament\Content\RelationManagers\ChildrenRelationManager;
use App\Filament\Resources\Pathways\PathwayResource;

class PathwaysRelationManager extends ChildrenRelationManager
{
    protected static string $relationship = 'pathways';

    protected static string $childResource = PathwayResource::class;
}
