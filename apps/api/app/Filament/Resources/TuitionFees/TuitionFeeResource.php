<?php

namespace App\Filament\Resources\TuitionFees;

use App\Filament\Content\ContentResource;
use App\Filament\Resources\TuitionFees\Pages\CreateTuitionFee;
use App\Filament\Resources\TuitionFees\Pages\EditTuitionFee;
use App\Filament\Resources\TuitionFees\Pages\ListTuitionFees;
use App\Models\TuitionFee;
use BackedEnum;
use Filament\Support\Icons\Heroicon;
use Illuminate\Database\Eloquent\Model;
use UnitEnum;

/**
 * Monthly fees, of an offer or the average of an institution.
 */
class TuitionFeeResource extends ContentResource
{
    protected static ?string $model = TuitionFee::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::Banknotes;

    protected static string|UnitEnum|null $navigationGroup = 'Formação';

    protected static ?int $navigationSort = 4;

    protected static ?string $modelLabel = 'propina';

    protected static ?string $pluralModelLabel = 'propinas';

    protected static array $tableColumns = ['monthly_aoa', 'academic_year'];

    public static function previewPath(Model $record): ?string
    {
        return '/academias/'.static::slugOf($record->getRelationValue('institution'));
    }

    public static function getPages(): array
    {
        return [
            'index' => ListTuitionFees::route('/'),
            'create' => CreateTuitionFee::route('/create'),
            'edit' => EditTuitionFee::route('/{record}/edit'),
        ];
    }
}
