<?php

namespace App\Http\Resources;

use App\Models\Agent;
use Illuminate\Http\Request;

/**
 * A Kayé agent (`Agent`): only what the person authorised.
 *
 * @extends ContentResource<Agent>
 */
class AgentResource extends ContentResource
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
            'area' => $this->value('area'),
            'verifiedBy' => $this->value('verified_by'),
            'verifiedAt' => $this->date('verified_at'),
            'consentAt' => $this->date('consent_at'),
        ], [
            'company' => $this->value('company'),
            'photo' => $this->value('photo'),
        ]);
    }
}
