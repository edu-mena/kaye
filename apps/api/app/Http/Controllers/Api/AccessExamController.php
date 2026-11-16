<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\AccessExamQuestionResource;
use App\Models\AccessExamQuestion;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * GET /access-exams: the bank of practice questions, each with its subject and topic.
 */
class AccessExamController extends PublicController
{
    public function index(Request $request): Response
    {
        return $this->content->respond($request, fn (): mixed => AccessExamQuestionResource::collection(
            self::published(AccessExamQuestion::class)->get(),
        ));
    }
}
