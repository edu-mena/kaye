<?php

namespace App\Filament\Resources\Institutions;

use App\Filament\Content\ContentResource;
use App\Filament\RelationManagers\AdmissionsRelationManager;
use App\Filament\RelationManagers\CourseOffersRelationManager;
use App\Filament\RelationManagers\ProgramsRelationManager;
use App\Filament\RelationManagers\TuitionFeesRelationManager;
use App\Filament\Resources\Institutions\Pages\CreateInstitution;
use App\Filament\Resources\Institutions\Pages\EditInstitution;
use App\Filament\Resources\Institutions\Pages\ListInstitutions;
use App\Models\Institution;
use BackedEnum;
use Filament\Support\Icons\Heroicon;
use Illuminate\Database\Eloquent\Model;
use UnitEnum;

/**
 * Schools and universities (Academias), with their offers, fees and admissions.
 */
class InstitutionResource extends ContentResource
{
    protected static ?string $model = Institution::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::BuildingLibrary;

    protected static string|UnitEnum|null $navigationGroup = 'Formação';

    protected static ?int $navigationSort = 1;

    protected static ?string $modelLabel = 'instituição';

    protected static ?string $pluralModelLabel = 'instituições';

    protected static array $tableColumns = ['type', 'province'];

    public static function previewPath(Model $record): ?string
    {
        return '/academias/'.static::slugOf($record);
    }

    public static function getRelations(): array
    {
        return [
            CourseOffersRelationManager::class,
            TuitionFeesRelationManager::class,
            AdmissionsRelationManager::class,
            ProgramsRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListInstitutions::route('/'),
            'create' => CreateInstitution::route('/create'),
            'edit' => EditInstitution::route('/{record}/edit'),
        ];
    }
}
