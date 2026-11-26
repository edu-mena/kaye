<?php

namespace App\Filament\RelationManagers;

use App\Filament\Content\RelationManagers\ChildrenRelationManager;
use App\Filament\Resources\CvExamples\CvExampleResource;

class CvExamplesRelationManager extends ChildrenRelationManager
{
    protected static string $relationship = 'cvExamples';

    protected static string $childResource = CvExampleResource::class;
}
