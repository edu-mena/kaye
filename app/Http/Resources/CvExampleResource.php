<?php

namespace App\Http\Resources;

use App\Models\CvExample;
use Illuminate\Http\Request;

/**
 * A model CV for one career (`CvExample`). Loaded: `career` and `pathway`.
 *
 * @extends ContentResource<CvExample>
 */
class CvExampleResource extends ContentResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->slug,
            'careerSlug' => $this->slugOf('career'),
            'pathwayId' => $this->slugOf('pathway'),
            'seniority' => $this->value('seniority'),
            'template' => $this->value('template'),
            'why' => $this->value('why'),
            'cv' => $this->value('cv'),
            'notes' => $this->value('notes'),
        ];
    }
}
