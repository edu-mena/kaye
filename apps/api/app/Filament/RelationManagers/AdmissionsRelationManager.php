<?php

namespace App\Filament\RelationManagers;

use App\Filament\Content\RelationManagers\ChildrenRelationManager;
use App\Filament\Resources\Admissions\AdmissionResource;

class AdmissionsRelationManager extends ChildrenRelationManager
{
    protected static string $relationship = 'admissions';

    protected static string $childResource = AdmissionResource::class;
}
