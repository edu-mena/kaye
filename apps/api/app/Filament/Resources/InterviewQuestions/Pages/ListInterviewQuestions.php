<?php

namespace App\Filament\Resources\InterviewQuestions\Pages;

use App\Filament\Content\Pages\ListContent;
use App\Filament\Resources\InterviewQuestions\InterviewQuestionResource;

class ListInterviewQuestions extends ListContent
{
    protected static string $resource = InterviewQuestionResource::class;
}
