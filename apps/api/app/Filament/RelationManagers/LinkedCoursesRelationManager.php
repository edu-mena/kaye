<?php

namespace App\Filament\RelationManagers;

use App\Filament\Content\RelationManagers\LinksRelationManager;

class LinkedCoursesRelationManager extends LinksRelationManager
{
    protected static string $relationship = 'courses';

    protected static ?string $title = 'Cursos';
}
