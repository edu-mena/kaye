<?php

namespace App\Http\Resources;

use App\Models\Career;
use Illuminate\Http\Request;

/**
 * A career in the list (`CareerSummary`).
 *
 * @extends ContentResource<Career>
 */
class CareerSummaryResource extends ContentResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return self::shape([
            'slug' => $this->resource->slug,
            'name' => $this->value('name'),
            'group' => $this->slugOf('group'),
            'summary' => $this->value('summary'),
            'riasec' => $this->value('riasec'),
            'demand' => $this->value('demand'),
            'salaryMedian' => $this->value('salary_median'),
            'detailed' => $this->value('detailed'),
        ], [
            'salaryKind' => $this->value('salary_kind'),
            'image' => $this->value('image'),
        ]);
    }
}
