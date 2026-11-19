<?php

namespace App\Http\Resources;

use App\Models\Skill;
use Illuminate\Http\Request;

/**
 * A skill once, whichever careers ask for it (`Skill`): the importance is the one the last career that asks for
 * it gives, as the app's list keeps it.
 *
 * @extends ContentResource<Skill>
 */
class SkillResource extends ContentResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return ['id' => $this->resource->slug, 'name' => $this->value('name'), 'importance' => $this->value('importance')];
    }
}
