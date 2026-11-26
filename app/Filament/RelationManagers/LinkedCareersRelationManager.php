<?php

namespace App\Filament\RelationManagers;

use App\Filament\Content\RelationManagers\LinksRelationManager;

class LinkedCareersRelationManager extends LinksRelationManager
{
    protected static string $relationship = 'careers';

    protected static ?string $title = 'Carreiras';
}
