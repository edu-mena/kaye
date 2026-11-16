<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\InternshipResource;
use App\Models\Internship;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * GET /internships
 */
class InternshipController extends PublicController
{
    public function index(Request $request): Response
    {
        return $this->content->respond($request, fn (): mixed => InternshipResource::collection(
            self::published(Internship::class)->with('company:id,slug')->get(),
        ));
    }
}
