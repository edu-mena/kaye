<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\ScholarshipResource;
use App\Models\Scholarship;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * GET /scholarships
 */
class ScholarshipController extends PublicController
{
    public function index(Request $request): Response
    {
        return $this->content->respond($request, fn (): mixed => ScholarshipResource::collection(
            self::published(Scholarship::class)->with('company:id,slug')->get(),
        ));
    }
}
