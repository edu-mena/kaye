<?php

namespace App\Filament\Resources\Mentors;

use App\Filament\Content\ContentResource;
use App\Filament\RelationManagers\LinkedCareersRelationManager;
use App\Filament\Resources\Mentors\Pages\CreateMentor;
use App\Filament\Resources\Mentors\Pages\EditMentor;
use App\Filament\Resources\Mentors\Pages\ListMentors;
use App\Models\Mentor;
use BackedEnum;
use Filament\Support\Icons\Heroicon;
use Illuminate\Database\Eloquent\Model;
use UnitEnum;

/**
 * Approved mentors (docs/mentores.md).
 */
class MentorResource extends ContentResource
{
    protected static ?string $model = Mentor::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::UserGroup;

    protected static string|UnitEnum|null $navigationGroup = 'Carreiras';

    protected static ?int $navigationSort = 9;

    protected static ?string $modelLabel = 'mentor';

    protected static ?string $pluralModelLabel = 'mentores';

    protected static array $tableColumns = ['role'];

    public static function previewPath(Model $record): ?string
    {
        return '/mentores';
    }

    public static function getRelations(): array
    {
        return [
            LinkedCareersRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListMentors::route('/'),
            'create' => CreateMentor::route('/create'),
            'edit' => EditMentor::route('/{record}/edit'),
        ];
    }
}
