<?php

namespace App\Filament\Resources\Scholarships;

use App\Filament\Content\ContentResource;
use App\Filament\Resources\Scholarships\Pages\CreateScholarship;
use App\Filament\Resources\Scholarships\Pages\EditScholarship;
use App\Filament\Resources\Scholarships\Pages\ListScholarships;
use App\Models\Scholarship;
use BackedEnum;
use Filament\Support\Icons\Heroicon;
use Illuminate\Database\Eloquent\Model;
use UnitEnum;

/**
 * Scholarships, with their deadlines.
 */
class ScholarshipResource extends ContentResource
{
    protected static ?string $model = Scholarship::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::Gift;

    protected static string|UnitEnum|null $navigationGroup = 'Oportunidades';

    protected static ?int $navigationSort = 2;

    protected static ?string $modelLabel = 'bolsa de estudo';

    protected static ?string $pluralModelLabel = 'bolsas de estudo';

    protected static array $tableColumns = ['provider', 'deadline'];

    public static function previewPath(Model $record): ?string
    {
        return '/bolsas';
    }

    public static function getPages(): array
    {
        return [
            'index' => ListScholarships::route('/'),
            'create' => CreateScholarship::route('/create'),
            'edit' => EditScholarship::route('/{record}/edit'),
        ];
    }
}
