<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\SupportProgramResource;
use App\Models\SupportProgram;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * GET /support-programs: real programmes for starting on one's own.
 */
class SupportProgramController extends PublicController
{
    public function index(Request $request): Response
    {
        return $this->content->respond($request, fn (): mixed => SupportProgramResource::collection(self::published(SupportProgram::class)->get()));
    }
}
