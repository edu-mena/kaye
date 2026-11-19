<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\SkillResource;
use App\Support\Catalog;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * GET /skills: each skill of the published careers once.
 */
class SkillController extends PublicController
{
    public function index(Request $request, Catalog $catalog): Response
    {
        return $this->content->respond($request, fn (): mixed => SkillResource::collection($catalog->skills()));
    }
}
