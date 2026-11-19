<?php

namespace App\Http\Resources;

use App\Models\SupportProgram;
use Illuminate\Http\Request;

/**
 * A programme that helps someone start on their own (`SupportProgram`).
 *
 * @extends ContentResource<SupportProgram>
 */
class SupportProgramResource extends ContentResource
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
            'audience' => $this->value('audience'),
            'url' => $this->value('url'),
        ] + $this->sourced(), [
            'minAge' => $this->value('min_age'),
        ]);
    }
}
