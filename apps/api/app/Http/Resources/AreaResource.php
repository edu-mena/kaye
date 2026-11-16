<?php

namespace App\Http\Resources;

use App\Models\Area;
use Illuminate\Http\Request;

/**
 * An area of the Mercado (`{id, name}`).
 *
 * @extends ContentResource<Area>
 */
class AreaResource extends ContentResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return ['id' => $this->resource->slug, 'name' => $this->value('name')];
    }
}
