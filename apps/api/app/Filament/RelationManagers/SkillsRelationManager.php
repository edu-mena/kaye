<?php

namespace App\Filament\RelationManagers;

use App\Filament\Content\RelationManagers\LinksRelationManager;

class SkillsRelationManager extends LinksRelationManager
{
    protected static string $relationship = 'skills';

    protected static ?string $title = 'Competências';
}
