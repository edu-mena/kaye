<?php

namespace App\Http\Resources;

use App\Models\Testimonial;
use Illuminate\Http\Request;

/**
 * Someone who studies or works in a career (`Testimonial`). Loaded: `career` and `company`.
 *
 * @extends ContentResource<Testimonial>
 */
class TestimonialResource extends ContentResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return self::shape([
            'id' => $this->resource->slug,
            'careerSlug' => $this->slugOf('career'),
            'role' => $this->value('role'),
            'path' => $this->value('path'),
            'tip' => $this->value('tip'),
        ], [
            'name' => $this->value('name'),
            'place' => $this->value('place'),
            'years' => $this->value('years'),
            'companyId' => $this->slugOf('company'),
            'source' => $this->value('source'),
            'example' => $this->flag('example'),
        ]);
    }
}
