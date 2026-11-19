<?php

namespace App\Http\Resources;

use App\Models\Internship;
use Illuminate\Http\Request;

/**
 * A real internship or traineeship (`Internship`). Loaded: `company`.
 *
 * @extends ContentResource<Internship>
 */
class InternshipResource extends ContentResource
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
            'areas' => $this->value('areas'),
            'audience' => $this->value('audience'),
            'paid' => $this->value('paid'),
            'requirements' => $this->value('requirements'),
            'deadline' => $this->date('deadline'),
            'recurring' => $this->value('recurring'),
            'url' => $this->value('url'),
        ] + $this->sourced(), [
            'companyId' => $this->slugOf('company'),
            'minAge' => $this->value('min_age'),
            'maxAge' => $this->value('max_age'),
            'durationMonths' => $this->value('duration_months'),
            'province' => $this->value('province'),
        ]);
    }
}
