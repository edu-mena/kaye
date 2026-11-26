<?php

namespace App\Filament\Resources\SupportPrograms;

use App\Filament\Content\ContentResource;
use App\Filament\Resources\SupportPrograms\Pages\CreateSupportProgram;
use App\Filament\Resources\SupportPrograms\Pages\EditSupportProgram;
use App\Filament\Resources\SupportPrograms\Pages\ListSupportPrograms;
use App\Models\SupportProgram;
use BackedEnum;
use Filament\Support\Icons\Heroicon;
use Illuminate\Database\Eloquent\Model;
use UnitEnum;

/**
 * Support to work on your own (credit, training, incubators).
 */
class SupportProgramResource extends ContentResource
{
    protected static ?string $model = SupportProgram::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::Lifebuoy;

    protected static string|UnitEnum|null $navigationGroup = 'Oportunidades';

    protected static ?int $navigationSort = 4;

    protected static ?string $modelLabel = 'apoio por conta própria';

    protected static ?string $pluralModelLabel = 'apoios por conta própria';

    protected static array $tableColumns = ['provider', 'kind'];

    public static function previewPath(Model $record): ?string
    {
        return '/sem-universidade';
    }

    public static function getPages(): array
    {
        return [
            'index' => ListSupportPrograms::route('/'),
            'create' => CreateSupportProgram::route('/create'),
            'edit' => EditSupportProgram::route('/{record}/edit'),
        ];
    }
}
