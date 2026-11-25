<?php

namespace App\Filament\Resources\Admissions;

use App\Filament\Content\ContentResource;
use App\Filament\RelationManagers\LinkedCoursesRelationManager;
use App\Filament\Resources\Admissions\Pages\CreateAdmission;
use App\Filament\Resources\Admissions\Pages\EditAdmission;
use App\Filament\Resources\Admissions\Pages\ListAdmissions;
use App\Models\Admission;
use BackedEnum;
use Filament\Support\Icons\Heroicon;
use Illuminate\Database\Eloquent\Model;
use UnitEnum;

/**
 * Admission calendars: registration, exams, vacancies.
 */
class AdmissionResource extends ContentResource
{
    protected static ?string $model = Admission::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::CalendarDays;

    protected static string|UnitEnum|null $navigationGroup = 'Formação';

    protected static ?int $navigationSort = 5;

    protected static ?string $modelLabel = 'admissão';

    protected static ?string $pluralModelLabel = 'admissões';

    protected static array $tableColumns = ['academic_year'];

    public static function previewPath(Model $record): ?string
    {
        return '/academias/'.static::slugOf($record->getRelationValue('institution'));
    }

    public static function getRelations(): array
    {
        return [
            LinkedCoursesRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListAdmissions::route('/'),
            'create' => CreateAdmission::route('/create'),
            'edit' => EditAdmission::route('/{record}/edit'),
        ];
    }
}
