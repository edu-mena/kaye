<?php

namespace App\Http\Resources;

use App\Models\Figure;
use Illuminate\Http\Request;

/**
 * A real person worth following (`Figure`). Loaded: `careers`.
 *
 * @extends ContentResource<Figure>
 */
class FigureResource extends ContentResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return self::shape([
            'id' => $this->resource->slug,
            'name' => $this->value('name'),
            'role' => $this->value('role'),
            'why' => $this->value('why'),
            'careers' => $this->slugs('careers'),
            'follow' => $this->value('follow'),
            'source' => $this->value('source'),
        ], [
            'photo' => $this->value('photo'),
        ]);
    }
}
