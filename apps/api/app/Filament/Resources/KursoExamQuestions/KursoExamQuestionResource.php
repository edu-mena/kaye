<?php

namespace App\Filament\Resources\KursoExamQuestions;

use App\Filament\Content\ContentResource;
use App\Filament\Resources\KursoExamQuestions\Pages\CreateKursoExamQuestion;
use App\Filament\Resources\KursoExamQuestions\Pages\EditKursoExamQuestion;
use App\Filament\Resources\KursoExamQuestions\Pages\ListKursoExamQuestions;
use App\Models\KursoExamQuestion;
use BackedEnum;
use Filament\Support\Icons\Heroicon;
use Illuminate\Database\Eloquent\Model;
use UnitEnum;

/**
 * The exam questions of a Kurso.
 */
class KursoExamQuestionResource extends ContentResource
{
    protected static ?string $model = KursoExamQuestion::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::CheckCircle;

    protected static string|UnitEnum|null $navigationGroup = 'Testes e Kursos';

    protected static ?int $navigationSort = 6;

    protected static ?string $modelLabel = 'pergunta de exame de Kurso';

    protected static ?string $pluralModelLabel = 'perguntas de exames de Kursos';

    protected static array $tableColumns = ['kind'];

    public static function previewPath(Model $record): ?string
    {
        return '/kursos/'.static::slugOf($record->getRelationValue('kurso')).'/exame';
    }

    public static function getPages(): array
    {
        return [
            'index' => ListKursoExamQuestions::route('/'),
            'create' => CreateKursoExamQuestion::route('/create'),
            'edit' => EditKursoExamQuestion::route('/{record}/edit'),
        ];
    }
}
