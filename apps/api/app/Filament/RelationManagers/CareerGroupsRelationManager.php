<?php

namespace App\Filament\RelationManagers;

use App\Filament\Content\RelationManagers\ChildrenRelationManager;
use App\Filament\Resources\CareerGroups\CareerGroupResource;

class CareerGroupsRelationManager extends ChildrenRelationManager
{
    protected static string $relationship = 'groups';

    protected static string $childResource = CareerGroupResource::class;
}
