<?php

namespace App\Http\Resources;

use App\Models\Kurso;
use App\Models\KursoUnit;
use Illuminate\Http\Request;

/**
 * A Kurso without its lessons' text and its exam, which have routes of their own; an announced one ("Em breve")
 * is only `{id, title, body, icon}`. Loaded: `units`.
 *
 * @extends ContentResource<Kurso>
 */
class KursoResource extends ContentResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        if ($this->value('announced') === true) {
            return ['id' => $this->resource->slug, 'title' => $this->value('title'), 'body' => $this->value('subtitle'), 'icon' => $this->value('icon')];
        }

        return [
            'id' => $this->resource->slug,
            'title' => $this->value('title'),
            'level' => $this->value('level'),
            'lang' => $this->value('lang'),
            'icon' => $this->value('icon'),
            'tone' => $this->value('tone'),
            'subtitle' => $this->value('subtitle'),
            'audience' => $this->value('audience'),
            'goals' => $this->value('goals'),
            'credits' => $this->value('credits'),
            'units' => array_values($this->resource->units->map(fn (KursoUnit $unit): array => self::shape([
                'id' => $unit->slug,
                'number' => $unit->getAttribute('number'),
                'title' => $unit->getAttribute('title'),
                'summary' => $unit->getAttribute('summary'),
            ], [
                'lessons' => $unit->getAttribute('outline'),
            ]))->all()),
        ];
    }
}
