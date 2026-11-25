<?php

namespace App\Filament\Resources\Programs;

use App\Filament\Content\ContentResource;
use App\Filament\RelationManagers\LinkedCareersRelationManager;
use App\Filament\Resources\Programs\Pages\CreateProgram;
use App\Filament\Resources\Programs\Pages\EditProgram;
use App\Filament\Resources\Programs\Pages\ListPrograms;
use App\Models\Program;
use BackedEnum;
use Filament\Support\Icons\Heroicon;
use Illuminate\Database\Eloquent\Model;
use UnitEnum;

/**
 * Programs of the example institutions (drafts until real data replaces them).
 */
class ProgramResource extends ContentResource
{
    protected static ?string $model = Program::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::RectangleStack;

    protected static string|UnitEnum|null $navigationGroup = 'Formação';

    protected static ?int $navigationSort = 6;

    protected static ?string $modelLabel = 'programa';

    protected static ?string $pluralModelLabel = 'programas';

    protected static array $tableColumns = ['level'];

    public static function previewPath(Model $record): ?string
    {
        return '/cursos/'.static::slugOf($record);
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
            'index' => ListPrograms::route('/'),
            'create' => CreateProgram::route('/create'),
            'edit' => EditProgram::route('/{record}/edit'),
        ];
    }
}
