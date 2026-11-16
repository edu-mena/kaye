<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * A shape App\Support\Catalog computes from several tables (`CatalogCourse`, `CareerTraits`), or a document kept
 * whole in `datasets` (the Mercado figures): it goes out as it is.
 *
 * @property array<array-key, mixed> $resource
 */
class ComputedResource extends JsonResource
{
    /**
     * @return array<array-key, mixed>
     */
    public function toArray(Request $request): array
    {
        return $this->resource;
    }
}
