<?php

namespace App\Http\Resources;

use App\Models\Scholarship;
use Illuminate\Http\Request;

/**
 * A real scholarship (`Scholarship`). Loaded: `company`.
 *
 * @extends ContentResource<Scholarship>
 */
class ScholarshipResource extends ContentResource
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
            'kind' => $this->value('kind'),
            'destination' => $this->value('destination'),
            'levels' => $this->value('levels'),
            'areas' => $this->value('areas'),
            'covers' => $this->value('covers'),
            'requirements' => $this->value('requirements'),
            'deadline' => $this->date('deadline'),
            'recurring' => $this->value('recurring'),
            'url' => $this->value('url'),
        ] + $this->sourced(), [
            'companyId' => $this->slugOf('company'),
            'minAge' => $this->value('min_age'),
            'maxAge' => $this->value('max_age'),
        ]);
    }
}
