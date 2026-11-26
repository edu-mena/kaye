<?php

namespace App\Filament\Resources\AccessExamQuestions;

use App\Filament\Content\ContentResource;
use App\Filament\Resources\AccessExamQuestions\Pages\CreateAccessExamQuestion;
use App\Filament\Resources\AccessExamQuestions\Pages\EditAccessExamQuestion;
use App\Filament\Resources\AccessExamQuestions\Pages\ListAccessExamQuestions;
use App\Models\AccessExamQuestion;
use BackedEnum;
use Filament\Support\Icons\Heroicon;
use Illuminate\Database\Eloquent\Model;
use UnitEnum;

/**
 * Practice questions for the university access exams.
 */
class AccessExamQuestionResource extends ContentResource
{
    protected static ?string $model = AccessExamQuestion::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::PencilSquare;

    protected static string|UnitEnum|null $navigationGroup = 'Testes e Kursos';

    protected static ?int $navigationSort = 2;

    protected static ?string $modelLabel = 'pergunta de exame de acesso';

    protected static ?string $pluralModelLabel = 'perguntas de exames de acesso';

    protected static array $tableColumns = ['subject', 'level'];

    public static function previewPath(Model $record): ?string
    {
        return '/exames-de-acesso';
    }

    public static function getPages(): array
    {
        return [
            'index' => ListAccessExamQuestions::route('/'),
            'create' => CreateAccessExamQuestion::route('/create'),
            'edit' => EditAccessExamQuestion::route('/{record}/edit'),
        ];
    }
}
