<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\CareerResource;
use App\Http\Resources\CareerSummaryResource;
use App\Http\Resources\ComputedResource;
use App\Support\Catalog;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * GET /occupations (`CareerSummary[]`, or `CareerTraits[]` with `?fields=traits`) and /occupations/{slug}
 * (`Career`; 404 when it does not exist, is not published or has no guide yet).
 */
class OccupationController extends PublicController
{
    public function index(Request $request, Catalog $catalog): Response
    {
        if ($request->query('fields') === 'traits') {
            return $this->content->respond($request, fn (): mixed => ComputedResource::collection($catalog->careerTraits($request)));
        }

        return $this->content->respond($request, fn (): mixed => CareerSummaryResource::collection(
            self::careers()->with('group:id,slug')->get(),
        ));
    }

    public function show(Request $request, string $slug): Response
    {
        return $this->content->respond($request, function () use ($slug): ?CareerResource {
            $career = self::careers()->where('slug', $slug)->where('detailed', true)
                ->with(['group:id,slug', 'skills' => Catalog::published(), 'pathways' => Catalog::published()])
                ->first();

            return $career === null ? null : new CareerResource($career);
        });
    }
}
