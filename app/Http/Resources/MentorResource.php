<?php

namespace App\Http\Resources;

use App\Models\Mentor;
use Illuminate\Http\Request;

/**
 * A volunteer approved by Kayé (`Mentor`). Loaded: `careers`.
 *
 * @extends ContentResource<Mentor>
 */
class MentorResource extends ContentResource
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
            'careers' => $this->slugs('careers'),
            'bio' => $this->value('bio'),
            'languages' => $this->value('languages'),
            'consentAt' => $this->date('consent_at'),
            'availability' => $this->value('availability'),
        ], [
            'company' => $this->value('company'),
            'photo' => $this->value('photo'),
        ]);
    }
}
