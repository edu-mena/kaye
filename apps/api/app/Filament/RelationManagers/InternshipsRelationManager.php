<?php

namespace App\Filament\RelationManagers;

use App\Filament\Content\RelationManagers\ChildrenRelationManager;
use App\Filament\Resources\Internships\InternshipResource;

class InternshipsRelationManager extends ChildrenRelationManager
{
    protected static string $relationship = 'internships';

    protected static string $childResource = InternshipResource::class;
}
