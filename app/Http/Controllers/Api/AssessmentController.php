<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\AssessmentQuestionResource;
use App\Models\AssessmentQuestion;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * GET /assessment: the vocational test's questions in the language of Accept-Language.
 */
class AssessmentController extends PublicController
{
    public function index(Request $request): Response
    {
        return $this->content->respond($request, fn (): mixed => AssessmentQuestionResource::collection(
            self::published(AssessmentQuestion::class)->get(),
        ));
    }
}
