<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\AreaResource;
use App\Http\Resources\CareerGroupResource;
use App\Models\Area;
use App\Models\CareerGroup;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * GET /areas and /career-groups: the Mercado areas and the careers' groups, with their names in each language.
 */
class AreaController extends PublicController
{
    public function index(Request $request): Response
    {
        return $this->content->respond($request, fn (): mixed => AreaResource::collection(self::published(Area::class)->get()));
    }

    public function groups(Request $request): Response
    {
        return $this->content->respond($request, fn (): mixed => CareerGroupResource::collection(
            self::published(CareerGroup::class)->with('area:id,slug')->get(),
        ));
    }
}
