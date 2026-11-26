<?php

namespace App\Filament\Resources\FreeCourses;

use App\Filament\Content\ContentResource;
use App\Filament\RelationManagers\LinkedCareersRelationManager;
use App\Filament\Resources\FreeCourses\Pages\CreateFreeCourse;
use App\Filament\Resources\FreeCourses\Pages\EditFreeCourse;
use App\Filament\Resources\FreeCourses\Pages\ListFreeCourses;
use App\Models\FreeCourse;
use BackedEnum;
use Filament\Support\Icons\Heroicon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use UnitEnum;

/**
 * Free online courses linked to careers.
 */
class FreeCourseResource extends ContentResource
{
    protected static ?string $model = FreeCourse::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::ComputerDesktop;

    protected static string|UnitEnum|null $navigationGroup = 'Formação';

    protected static ?int $navigationSort = 7;

    protected static ?string $modelLabel = 'curso grátis online';

    protected static ?string $pluralModelLabel = 'cursos grátis online';

    protected static array $tableColumns = ['provider', 'level'];

    public static function previewPath(Model $record): ?string
    {
        // The app shows the free courses on the pages of their careers.
        $careers = $record->getRelationValue('careers');

        return '/carreiras/'.static::slugOf($careers instanceof Collection ? $careers->first() : null);
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
            'index' => ListFreeCourses::route('/'),
            'create' => CreateFreeCourse::route('/create'),
            'edit' => EditFreeCourse::route('/{record}/edit'),
        ];
    }
}
