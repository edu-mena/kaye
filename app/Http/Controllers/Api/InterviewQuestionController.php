<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\InterviewQuestionResource;
use App\Models\InterviewQuestion;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * GET /interview-questions: the general questions (`area` null) and those of each area.
 */
class InterviewQuestionController extends PublicController
{
    public function index(Request $request): Response
    {
        return $this->content->respond($request, fn (): mixed => InterviewQuestionResource::collection(
            self::published(InterviewQuestion::class)->get(),
        ));
    }
}
