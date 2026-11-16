<?php

namespace App\Http\Resources;

use App\Models\InterviewQuestion;
use Illuminate\Http\Request;

/**
 * A question of the interview practice; `area` is null for the general ones.
 *
 * @extends ContentResource<InterviewQuestion>
 */
class InterviewQuestionResource extends ContentResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->slug,
            'text' => $this->value('text'),
            'goal' => $this->value('goal'),
            'model' => $this->value('model'),
            'mistakes' => $this->value('mistakes'),
            'area' => $this->value('area'),
        ];
    }
}
