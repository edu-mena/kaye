<?php

namespace App\Filament\Resources\Careers;

use App\Filament\Content\ContentResource;
use App\Filament\RelationManagers\CvExamplesRelationManager;
use App\Filament\RelationManagers\PathwaysRelationManager;
use App\Filament\RelationManagers\SkillsRelationManager;
use App\Filament\RelationManagers\TestimonialsRelationManager;
use App\Filament\RelationManagers\VideoStoriesRelationManager;
use App\Filament\Resources\Careers\Pages\CreateCareer;
use App\Filament\Resources\Careers\Pages\EditCareer;
use App\Filament\Resources\Careers\Pages\ListCareers;
use App\Models\Career;
use BackedEnum;
use Filament\Support\Icons\Heroicon;
use Illuminate\Database\Eloquent\Model;
use UnitEnum;

/**
 * The professions: the summary and, once curated, the full guide.
 */
class CareerResource extends ContentResource
{
    protected static ?string $model = Career::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::Briefcase;

    protected static string|UnitEnum|null $navigationGroup = 'Carreiras';

    protected static ?int $navigationSort = 3;

    protected static ?string $modelLabel = 'carreira';

    protected static ?string $pluralModelLabel = 'carreiras';

    protected static ?string $areaRelation = 'group.area';

    protected static array $tableColumns = ['demand', 'salary_median'];

    public static function previewPath(Model $record): ?string
    {
        return '/carreiras/'.static::slugOf($record);
    }

    public static function getRelations(): array
    {
        return [
            SkillsRelationManager::class,
            PathwaysRelationManager::class,
            CvExamplesRelationManager::class,
            TestimonialsRelationManager::class,
            VideoStoriesRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListCareers::route('/'),
            'create' => CreateCareer::route('/create'),
            'edit' => EditCareer::route('/{record}/edit'),
        ];
    }
}
