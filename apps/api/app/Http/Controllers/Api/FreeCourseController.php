<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\FreeCourseResource;
use App\Models\FreeCourse;
use App\Support\Catalog;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * GET /free-courses?occupation=
 */
class FreeCourseController extends PublicController
{
    public function index(Request $request): Response
    {
        return $this->content->respond($request, fn (): mixed => FreeCourseResource::collection(
            self::ofCareer(self::published(FreeCourse::class), self::occupation($request))->with(Catalog::links())->get(),
        ));
    }
}
