<?php

namespace App\Filament\Resources\Kursos;

use App\Filament\Content\ContentResource;
use App\Filament\RelationManagers\KursoExamQuestionsRelationManager;
use App\Filament\RelationManagers\KursoUnitsRelationManager;
use App\Filament\Resources\Kursos\Pages\CreateKurso;
use App\Filament\Resources\Kursos\Pages\EditKurso;
use App\Filament\Resources\Kursos\Pages\ListKursos;
use App\Models\Kurso;
use BackedEnum;
use Filament\Support\Icons\Heroicon;
use Illuminate\Database\Eloquent\Model;
use UnitEnum;

/**
 * The Kursos (ADR 0016, 0025), with their units and exam.
 */
class KursoResource extends ContentResource
{
    protected static ?string $model = Kurso::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::LightBulb;

    protected static string|UnitEnum|null $navigationGroup = 'Testes e Kursos';

    protected static ?int $navigationSort = 4;

    protected static ?string $modelLabel = 'Kurso';

    protected static ?string $pluralModelLabel = 'Kursos';

    public static function previewPath(Model $record): ?string
    {
        return '/kursos/'.static::slugOf($record);
    }

    public static function getRelations(): array
    {
        return [
            KursoUnitsRelationManager::class,
            KursoExamQuestionsRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListKursos::route('/'),
            'create' => CreateKurso::route('/create'),
            'edit' => EditKurso::route('/{record}/edit'),
        ];
    }
}
