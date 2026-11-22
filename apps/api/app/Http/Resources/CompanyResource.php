<?php

namespace App\Http\Resources;

use App\Models\Company;
use Illuminate\Http\Request;

/**
 * A real company (`Company`). Loaded: `careers` and `partners`.
 *
 * @extends ContentResource<Company>
 */
class CompanyResource extends ContentResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return self::shape([
            'id' => $this->resource->slug,
            'name' => $this->value('name'),
            'sector' => $this->value('sector'),
            'province' => $this->value('province'),
            'place' => $this->value('place'),
            'summary' => $this->value('summary'),
            'careers' => $this->slugs('careers'),
            'careersSourced' => $this->value('careers_sourced'),
            'areas' => $this->value('groups'),
            'programs' => $this->value('programs'),
            'partners' => $this->slugs('partners'),
            'sources' => $this->value('sources'),
        ], [
            'logo' => $this->value('logo'),
            'banner' => $this->value('banner'),
            'website' => $this->value('website'),
            'roles' => $this->value('roles'),
            'people' => $this->value('people'),
            'activities' => $this->value('activities'),
            'activitiesSource' => $this->value('activities_source'),
            'socials' => $this->value('socials'),
            'founded' => $this->value('founded'),
            'employees' => $this->value('employees'),
            'logoOnDark' => $this->flag('logo_on_dark'),
            'insights' => $this->value('insights'),
            'quotes' => $this->value('quotes'),
            'headquarters' => $this->value('headquarters'),
            'estimated' => $this->resource->estimated ? true : null,
        ]);
    }
}
