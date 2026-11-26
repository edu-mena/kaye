<?php

namespace App\Filament\RelationManagers;

use App\Filament\Content\RelationManagers\ChildrenRelationManager;
use App\Filament\Resources\Scholarships\ScholarshipResource;

class ScholarshipsRelationManager extends ChildrenRelationManager
{
    protected static string $relationship = 'scholarships';

    protected static string $childResource = ScholarshipResource::class;
}
