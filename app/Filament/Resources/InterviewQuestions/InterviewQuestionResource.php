<?php

namespace App\Filament\Resources\InterviewQuestions;

use App\Filament\Content\ContentResource;
use App\Filament\Resources\InterviewQuestions\Pages\CreateInterviewQuestion;
use App\Filament\Resources\InterviewQuestions\Pages\EditInterviewQuestion;
use App\Filament\Resources\InterviewQuestions\Pages\ListInterviewQuestions;
use App\Models\InterviewQuestion;
use BackedEnum;
use Filament\Support\Icons\Heroicon;
use Illuminate\Database\Eloquent\Model;
use UnitEnum;

/**
 * Job interview practice questions.
 */
class InterviewQuestionResource extends ContentResource
{
    protected static ?string $model = InterviewQuestion::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::ChatBubbleLeftEllipsis;

    protected static string|UnitEnum|null $navigationGroup = 'Testes e Kursos';

    protected static ?int $navigationSort = 3;

    protected static ?string $modelLabel = 'pergunta de entrevista';

    protected static ?string $pluralModelLabel = 'perguntas de entrevista';

    protected static array $tableColumns = ['area'];

    public static function previewPath(Model $record): ?string
    {
        return '/entrevistas';
    }

    public static function getPages(): array
    {
        return [
            'index' => ListInterviewQuestions::route('/'),
            'create' => CreateInterviewQuestion::route('/create'),
            'edit' => EditInterviewQuestion::route('/{record}/edit'),
        ];
    }
}
