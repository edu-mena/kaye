<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\AdmissionResource;
use App\Models\Admission;
use App\Support\Catalog;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * GET /admissions: the access exam calls.
 */
class AdmissionController extends PublicController
{
    public function index(Request $request): Response
    {
        return $this->content->respond($request, fn (): mixed => AdmissionResource::collection(
            self::published(Admission::class)->with(['institution:id,slug', ...Catalog::links('courses')])->get(),
        ));
    }
}
