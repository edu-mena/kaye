<?php

namespace App\Filament\Resources\CourseOffers;

use App\Filament\Content\ContentResource;
use App\Filament\RelationManagers\LinkedCareersRelationManager;
use App\Filament\Resources\CourseOffers\Pages\CreateCourseOffer;
use App\Filament\Resources\CourseOffers\Pages\EditCourseOffer;
use App\Filament\Resources\CourseOffers\Pages\ListCourseOffers;
use App\Models\CourseOffer;
use BackedEnum;
use Filament\Support\Icons\Heroicon;
use Illuminate\Database\Eloquent\Model;
use UnitEnum;

/**
 * A course at one institution: level, faculty, duration, curriculum.
 */
class CourseOfferResource extends ContentResource
{
    protected static ?string $model = CourseOffer::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::AcademicCap;

    protected static string|UnitEnum|null $navigationGroup = 'Formação';

    protected static ?int $navigationSort = 3;

    protected static ?string $modelLabel = 'oferta de curso';

    protected static ?string $pluralModelLabel = 'ofertas de cursos';

    protected static array $tableColumns = ['level', 'faculty'];

    public static function previewPath(Model $record): ?string
    {
        return '/cursos/curso/'.static::slugOf($record->getRelationValue('course')).'?academia='.static::slugOf($record->getRelationValue('institution'));
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
            'index' => ListCourseOffers::route('/'),
            'create' => CreateCourseOffer::route('/create'),
            'edit' => EditCourseOffer::route('/{record}/edit'),
        ];
    }
}
