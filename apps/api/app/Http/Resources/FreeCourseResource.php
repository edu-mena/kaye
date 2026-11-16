<?php

namespace App\Http\Resources;

use App\Models\FreeCourse;
use Illuminate\Http\Request;

/**
 * A free (or nearly free) online course (`FreeCourse`). Loaded: `careers`.
 *
 * @extends ContentResource<FreeCourse>
 */
class FreeCourseResource extends ContentResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return self::shape([
            'id' => $this->resource->slug,
            'name' => $this->value('name'),
            'provider' => $this->value('provider'),
            'languages' => $this->value('languages'),
            'careerSlugs' => $this->slugs('careers'),
            'areas' => $this->value('areas'),
            'certificate' => $this->value('certificate'),
            'level' => $this->value('level'),
            'url' => $this->value('url'),
        ] + $this->sourced(), [
            'hours' => $this->value('hours'),
            'credential' => $this->value('credential'),
            'priceUsd' => $this->value('price_usd'),
        ]);
    }
}
