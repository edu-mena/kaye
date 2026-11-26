<?php

namespace App\Filament\Resources\CvExamples;

use App\Filament\Content\ContentResource;
use App\Filament\Resources\CvExamples\Pages\CreateCvExample;
use App\Filament\Resources\CvExamples\Pages\EditCvExample;
use App\Filament\Resources\CvExamples\Pages\ListCvExamples;
use App\Models\CvExample;
use BackedEnum;
use Filament\Support\Icons\Heroicon;
use Illuminate\Database\Eloquent\Model;
use UnitEnum;

/**
 * Example CVs of a career and pathway.
 */
class CvExampleResource extends ContentResource
{
    protected static ?string $model = CvExample::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::DocumentText;

    protected static string|UnitEnum|null $navigationGroup = 'Carreiras';

    protected static ?int $navigationSort = 6;

    protected static ?string $modelLabel = 'CV modelo';

    protected static ?string $pluralModelLabel = 'CVs modelo';

    protected static ?string $areaRelation = 'career.group.area';

    protected static array $tableColumns = ['seniority', 'template'];

    public static function previewPath(Model $record): ?string
    {
        return '/cv/modelos/'.static::slugOf($record);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListCvExamples::route('/'),
            'create' => CreateCvExample::route('/create'),
            'edit' => EditCvExample::route('/{record}/edit'),
        ];
    }
}
