<?php

namespace App\Filament\Resources\AssessmentQuestions;

use App\Filament\Content\ContentResource;
use App\Filament\Resources\AssessmentQuestions\Pages\CreateAssessmentQuestion;
use App\Filament\Resources\AssessmentQuestions\Pages\EditAssessmentQuestion;
use App\Filament\Resources\AssessmentQuestions\Pages\ListAssessmentQuestions;
use App\Models\AssessmentQuestion;
use BackedEnum;
use Filament\Support\Icons\Heroicon;
use Illuminate\Database\Eloquent\Model;
use UnitEnum;

/**
 * The questions of the vocational test.
 */
class AssessmentQuestionResource extends ContentResource
{
    protected static ?string $model = AssessmentQuestion::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::QuestionMarkCircle;

    protected static string|UnitEnum|null $navigationGroup = 'Testes e Kursos';

    protected static ?int $navigationSort = 1;

    protected static ?string $modelLabel = 'pergunta do teste';

    protected static ?string $pluralModelLabel = 'perguntas do teste';

    protected static array $tableColumns = ['kind', 'dimension'];

    public static function previewPath(Model $record): ?string
    {
        return '/teste';
    }

    public static function getPages(): array
    {
        return [
            'index' => ListAssessmentQuestions::route('/'),
            'create' => CreateAssessmentQuestion::route('/create'),
            'edit' => EditAssessmentQuestion::route('/{record}/edit'),
        ];
    }
}
