<?php

namespace App\Http\Resources;

use App\Models\VideoStory;
use Illuminate\Http\Request;

/**
 * An "O meu dia como…" video (`VideoStory`). Loaded: `career`.
 *
 * @extends ContentResource<VideoStory>
 */
class VideoStoryResource extends ContentResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return self::shape([
            'id' => $this->resource->slug,
            'careerSlug' => $this->slugOf('career'),
            'name' => $this->value('name'),
            'role' => $this->value('role'),
            'title' => $this->value('title'),
            'url' => $this->value('url'),
            'platform' => $this->value('platform'),
            'durationSeconds' => $this->value('duration_seconds'),
            'consentAt' => $this->date('consent_at'),
            'recordedAt' => $this->date('recorded_at'),
        ], [
            'company' => $this->value('company'),
            'thumbnail' => $this->value('thumbnail'),
        ]);
    }
}
