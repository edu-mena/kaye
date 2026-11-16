<?php

namespace App\Http\Resources;

use App\Models\Career;
use App\Models\Pathway;
use App\Models\Skill;
use Illuminate\Database\Eloquent\Relations\Pivot;
use Illuminate\Http\Request;

/**
 * A career's full guide (`Career`, with `selfEmployment` when it has one).
 *
 * @extends ContentResource<Career>
 */
class CareerResource extends ContentResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return (new CareerSummaryResource($this->resource))->toArray($request) + self::shape([
            'description' => $this->value('description'),
            'dayToDay' => $this->value('day_to_day'),
            'workContext' => $this->value('work_context'),
            'workStyles' => $this->value('work_styles'),
            'skills' => self::skills($this->resource),
            'pathways' => $this->resource->pathways->map(fn (Pathway $pathway): array => self::pathway($pathway))->all(),
            'stages' => $this->value('stages'),
            'employerAsks' => $this->value('employer_asks'),
            'market' => $this->value('market'),
            'cvGuide' => $this->value('cv_guide'),
        ], [
            'selfEmployment' => $this->value('self_employment'),
        ]);
    }

    /**
     * The career's skills as the career names them, with the importance it gives each (`{id, name, importance}`).
     *
     * @return list<array{id: string, name: mixed, importance: mixed}>
     */
    public static function skills(Career $career): array
    {
        $skills = [];
        foreach ($career->skills as $skill) {
            $link = self::link($skill);
            $skills[] = [
                'id' => $skill->slug,
                'name' => self::translation($link?->getAttribute('name')) ?? $skill->getAttribute('name'),
                'importance' => $link?->getAttribute('importance'),
            ];
        }

        return $skills;
    }

    /**
     * The row of `career_skill` a skill was loaded through (its importance, position and the career's name for it).
     */
    public static function link(Skill $skill): ?Pivot
    {
        $link = $skill->getRelationValue('pivot');

        return $link instanceof Pivot ? $link : null;
    }

    /**
     * @return array<string, mixed>
     */
    private static function pathway(Pathway $pathway): array
    {
        $min = $pathway->getAttribute('total_cost_min');
        $max = $pathway->getAttribute('total_cost_max');

        return self::shape([
            'id' => $pathway->slug,
            'name' => $pathway->getAttribute('name'),
            'summary' => $pathway->getAttribute('summary'),
            'steps' => $pathway->getAttribute('steps'),
            'totalCost' => $min === null && $max === null ? null : ['min' => $min, 'max' => $max],
        ], [
            'estimated' => $pathway->estimated ? true : null,
        ]);
    }
}
