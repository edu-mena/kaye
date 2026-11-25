<?php

namespace App\Filament\RelationManagers;

use App\Filament\Content\RelationManagers\LinksRelationManager;

class LinkedInstitutionsRelationManager extends LinksRelationManager
{
    protected static string $relationship = 'institutions';

    protected static ?string $title = 'Instituições';
}
