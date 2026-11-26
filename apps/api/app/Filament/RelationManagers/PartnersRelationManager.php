<?php

namespace App\Filament\RelationManagers;

use App\Filament\Content\RelationManagers\LinksRelationManager;

class PartnersRelationManager extends LinksRelationManager
{
    protected static string $relationship = 'partners';

    protected static ?string $title = 'Academias parceiras';
}
