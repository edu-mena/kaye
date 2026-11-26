<?php

namespace App\Filament\RelationManagers;

use App\Filament\Content\RelationManagers\LinksRelationManager;

class LinkedCompaniesRelationManager extends LinksRelationManager
{
    protected static string $relationship = 'companies';

    protected static ?string $title = 'Empresas';
}
