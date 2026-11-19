<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\InstitutionResource;
use App\Support\Catalog;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * GET /institutions (`Academy[]`) and /institutions/{slug}.
 */
class InstitutionController extends PublicController
{
    public function index(Request $request, Catalog $catalog): Response
    {
        return $this->content->respond($request, fn (): mixed => InstitutionResource::collection($catalog->institutions()));
    }

    public function show(Request $request, Catalog $catalog, string $slug): Response
    {
        return $this->content->respond($request, function () use ($catalog, $slug): ?InstitutionResource {
            $institution = $catalog->institutions($slug)->first();

            return $institution === null ? null : new InstitutionResource($institution);
        });
    }
}
