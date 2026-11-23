<?php

namespace App\Http\Resources;

use App\Models\Simulation;
use Illuminate\Http\Request;

/**
 * A working day of a career (`Simulation`). Loaded: `career` and `agent`.
 *
 * @extends ContentResource<Simulation>
 */
class SimulationResource extends ContentResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return self::shape([
            'id' => $this->resource->slug,
            'careerSlug' => $this->slugOf('career'),
            'title' => $this->value('title'),
            'intro' => $this->value('intro'),
            'minutes' => $this->value('minutes'),
            'moments' => $this->value('moments'),
            'asks' => $this->value('asks'),
            'next' => $this->value('next_steps'),
            'languages' => $this->value('languages'),
        ], [
            'agentId' => $this->slugOf('agent'),
            'example' => $this->flag('example'),
        ]);
    }
}
