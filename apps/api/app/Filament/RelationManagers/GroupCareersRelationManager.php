<?php

namespace App\Filament\RelationManagers;

use App\Filament\Content\RelationManagers\ChildrenRelationManager;
use App\Filament\Resources\Careers\CareerResource;

class GroupCareersRelationManager extends ChildrenRelationManager
{
    protected static string $relationship = 'careers';

    protected static string $childResource = CareerResource::class;
}
