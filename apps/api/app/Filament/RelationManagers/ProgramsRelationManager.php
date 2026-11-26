<?php

namespace App\Filament\RelationManagers;

use App\Filament\Content\RelationManagers\ChildrenRelationManager;
use App\Filament\Resources\Programs\ProgramResource;

class ProgramsRelationManager extends ChildrenRelationManager
{
    protected static string $relationship = 'programs';

    protected static string $childResource = ProgramResource::class;
}
