<?php

namespace App\Http\Resources;

use App\Models\CareerGroup;
use Illuminate\Http\Request;

/**
 * A group of careers and its area (`{id, area, name}`).
 *
 * @extends ContentResource<CareerGroup>
 */
class CareerGroupResource extends ContentResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return ['id' => $this->resource->slug, 'area' => $this->slugOf('area'), 'name' => $this->value('name')];
    }
}
