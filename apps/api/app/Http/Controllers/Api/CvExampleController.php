<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\CvExampleResource;
use App\Models\CvExample;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * GET /cv-examples and /occupations/{slug}/cv-examples: the model CVs.
 */
class CvExampleController extends PublicController
{
    public function index(Request $request, ?string $slug = null): Response
    {
        return $this->content->respond($request, fn (): mixed => CvExampleResource::collection(
            self::ofCareer(self::published(CvExample::class), $slug, 'career')->with(['career:id,slug', 'pathway:id,slug'])->get(),
        ));
    }
}
