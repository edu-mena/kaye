<?php

namespace App\Filament\RelationManagers;

use App\Filament\Content\RelationManagers\ChildrenRelationManager;
use App\Filament\Resources\KursoExamQuestions\KursoExamQuestionResource;

class KursoExamQuestionsRelationManager extends ChildrenRelationManager
{
    protected static string $relationship = 'examQuestions';

    protected static string $childResource = KursoExamQuestionResource::class;
}
