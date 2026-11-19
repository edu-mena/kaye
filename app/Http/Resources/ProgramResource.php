<?php

namespace App\Http\Resources;

use App\Models\Program;
use Illuminate\Http\Request;

/**
 * A course at an institution of the old ranking (`Program`). Loaded: `institution`, `course` and `careers`.
 *
 * @extends ContentResource<Program>
 */
class ProgramResource extends ContentResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $average = $this->value('rating_average');
        $count = $this->value('rating_count');

        return self::shape([
            'id' => $this->resource->slug,
            'institution' => InstitutionResource::summary($this->resource->institution, withLogo: true),
            'course' => ['id' => $this->resource->course?->slug, 'name' => $this->resource->course?->getAttribute('name')],
            'name' => $this->value('name'),
            'level' => $this->value('level'),
            'durationMonths' => $this->value('duration_months'),
            'schedule' => $this->value('schedule'),
            'totalCost' => $this->value('total_cost'),
            'recognized' => $this->value('recognized'),
            'rating' => $average === null || $count === null ? null : ['average' => $average, 'count' => $count],
            'careers' => $this->slugs('careers'),
        ], [
            'image' => $this->value('image'),
        ]);
    }
}
