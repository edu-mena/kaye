<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\ComputedResource;
use App\Support\Catalog;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * GET /courses (`CatalogCourse[]`: every course with its offer at each institution) and /courses/{slug}.
 */
class CourseController extends PublicController
{
    public function index(Request $request, Catalog $catalog): Response
    {
        return $this->content->respond($request, fn (): mixed => ComputedResource::collection($catalog->courses($request)));
    }

    public function show(Request $request, Catalog $catalog, string $slug): Response
    {
        return $this->content->respond($request, function () use ($request, $catalog, $slug): ?ComputedResource {
            foreach ($catalog->courses($request) as $course) {
                if ($course['id'] === $slug) {
                    return new ComputedResource($course);
                }
            }

            return null;
        });
    }
}
