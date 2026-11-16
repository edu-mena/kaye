<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\TestimonialResource;
use App\Models\Testimonial;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * GET /testimonials and /occupations/{slug}/testimonials. The made-up examples are drafts: never shown here.
 */
class TestimonialController extends PublicController
{
    public function index(Request $request, ?string $slug = null): Response
    {
        return $this->content->respond($request, fn (): mixed => TestimonialResource::collection(
            self::ofCareer(self::published(Testimonial::class), $slug, 'career')->with(['career:id,slug', 'company:id,slug'])->get(),
        ));
    }
}
