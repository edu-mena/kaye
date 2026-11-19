<?php

namespace App\Http\Resources;

use App\Models\AssessmentQuestion;
use Illuminate\Http\Request;

/**
 * A question of the vocational test (`AssessmentQuestion`).
 *
 * @extends ContentResource<AssessmentQuestion>
 */
class AssessmentQuestionResource extends ContentResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return ['id' => $this->resource->slug, 'dimension' => $this->value('dimension'), 'text' => $this->value('text')];
    }
}
