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
        if ($this->value('kind') === 'situation') {
            return [
                'kind' => 'situation', 'id' => $this->resource->slug, 'context' => $this->value('context'),
                'text' => $this->value('text'), 'options' => $this->value('options'),
            ];
        }

        return ['kind' => 'statement', 'id' => $this->resource->slug, 'dimension' => $this->value('dimension'), 'text' => $this->value('text')];
    }
}
