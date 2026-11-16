<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\ComputedResource;
use App\Models\Dataset;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * The documents read whole: GET /market/jobs, /market/education, /market/employment, /psychotech and
 * /provinces. The route gives the dataset's slug.
 */
class DatasetController extends PublicController
{
    public function show(Request $request, string $dataset): Response
    {
        return $this->content->respond($request, function () use ($dataset): ?ComputedResource {
            $data = self::published(Dataset::class)->where('slug', $dataset)->first()?->data;

            return is_array($data) ? new ComputedResource($data) : null;
        });
    }
}
