<?php

namespace App\Http\Resources;

use App\Models\Institution;
use Illuminate\Http\Request;

/**
 * A real institution and its offers (`Academy`). Its `offers` and `tuitionFees` come loaded (App\Catalog\Academies).
 *
 * @extends ContentResource<Institution>
 */
class InstitutionResource extends ContentResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return self::shape([
            'id' => $this->resource->slug,
            'name' => $this->value('name'),
            'type' => $this->value('type'),
            'ownership' => $this->value('ownership'),
            'province' => $this->value('province'),
            'place' => $this->value('place'),
            'summary' => $this->value('summary'),
            'offers' => OfferResource::collection($this->resource->courseOffers)->resolve($request),
            'sources' => $this->value('sources'),
            'mapsUrl' => $this->value('maps_url'),
        ], [
            'website' => $this->value('website'),
            'logo' => $this->value('logo'),
            'banner' => $this->value('banner'),
            'minAge' => $this->value('min_age'),
            'phone' => $this->value('phone'),
            'email' => $this->value('email'),
            'address' => $this->value('address'),
            'social' => $this->value('social'),
            'checkedAt' => $this->date('source_checked_at'),
            'founded' => $this->value('founded'),
            'recognizedBy' => $this->value('recognized_by'),
        ]);
    }

    /**
     * What a course or a programme shows of the institution (`{id, name, type, ownership, province}`).
     *
     * @return array<string, mixed>|null
     */
    public static function summary(?Institution $institution, bool $withLogo = false): ?array
    {
        return $institution === null ? null : self::shape([
            'id' => $institution->slug,
            'name' => $institution->getAttribute('name'),
            'type' => $institution->getAttribute('type'),
            'ownership' => $institution->getAttribute('ownership'),
            'province' => $institution->getAttribute('province'),
        ], [
            'logo' => $withLogo ? $institution->getAttribute('logo') : null,
        ]);
    }
}
