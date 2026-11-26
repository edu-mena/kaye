<?php

namespace App\Filament\RelationManagers;

use App\Filament\Content\RelationManagers\LinksRelationManager;

class LinkedAreasRelationManager extends LinksRelationManager
{
    protected static string $relationship = 'areas';

    protected static ?string $title = 'Áreas';
}
