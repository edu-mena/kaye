<?php

namespace App\Filament\Resources\Skills;

use App\Filament\Content\ContentResource;
use App\Filament\Resources\Skills\Pages\CreateSkill;
use App\Filament\Resources\Skills\Pages\EditSkill;
use App\Filament\Resources\Skills\Pages\ListSkills;
use App\Models\Skill;
use BackedEnum;
use Filament\Support\Icons\Heroicon;
use UnitEnum;

/**
 * The skills the careers ask for.
 */
class SkillResource extends ContentResource
{
    protected static ?string $model = Skill::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::WrenchScrewdriver;

    protected static string|UnitEnum|null $navigationGroup = 'Carreiras';

    protected static ?int $navigationSort = 5;

    protected static ?string $modelLabel = 'competência';

    protected static ?string $pluralModelLabel = 'competências';

    public static function getPages(): array
    {
        return [
            'index' => ListSkills::route('/'),
            'create' => CreateSkill::route('/create'),
            'edit' => EditSkill::route('/{record}/edit'),
        ];
    }
}
