<?php

namespace App\Filament\Resources\KursoUnits;

use App\Filament\Content\ContentResource;
use App\Filament\Resources\KursoUnits\Pages\CreateKursoUnit;
use App\Filament\Resources\KursoUnits\Pages\EditKursoUnit;
use App\Filament\Resources\KursoUnits\Pages\ListKursoUnits;
use App\Models\KursoUnit;
use BackedEnum;
use Filament\Support\Icons\Heroicon;
use Illuminate\Database\Eloquent\Model;
use UnitEnum;

/**
 * A unit of a Kurso and its lessons.
 */
class KursoUnitResource extends ContentResource
{
    protected static ?string $model = KursoUnit::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::ListBullet;

    protected static string|UnitEnum|null $navigationGroup = 'Testes e Kursos';

    protected static ?int $navigationSort = 5;

    protected static ?string $modelLabel = 'unidade de Kurso';

    protected static ?string $pluralModelLabel = 'unidades de Kursos';

    protected static array $tableColumns = ['number'];

    public static function previewPath(Model $record): ?string
    {
        return '/kursos/'.static::slugOf($record->getRelationValue('kurso'));
    }

    public static function getPages(): array
    {
        return [
            'index' => ListKursoUnits::route('/'),
            'create' => CreateKursoUnit::route('/create'),
            'edit' => EditKursoUnit::route('/{record}/edit'),
        ];
    }
}
