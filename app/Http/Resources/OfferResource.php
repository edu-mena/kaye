<?php

namespace App\Http\Resources;

use App\Models\CourseOffer;
use App\Models\TuitionFee;
use Illuminate\Http\Request;

/**
 * A course at one institution (`AcademyOffer`). The fee is the offer's own or, for a licenciatura without one,
 * the institution's average (one row of `tuition_fees` without an offer). Loaded: `course`, `careers`, `tuitionFee`
 * and `institution.averageFee`.
 *
 * @extends ContentResource<CourseOffer>
 */
class OfferResource extends ContentResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $course = $this->resource->course;

        return self::shape([
            'course' => ['id' => $course?->slug, 'name' => $this->value('course_name') ?? $course?->getAttribute('name')],
            'name' => $this->value('name'),
            'level' => $this->value('level'),
            'careers' => $this->slugs('careers'),
            'areas' => $this->value('groups'),
        ], [
            'recognition' => $this->value('recognition'),
            'students' => $this->value('students'),
            'graduates' => $this->value('graduates'),
            'year' => $this->value('year'),
            'curriculum' => $this->value('curriculum'),
            'fee' => self::feeShape($this->fee()),
            'faculty' => $this->value('faculty'),
        ]);
    }

    private function fee(): ?TuitionFee
    {
        $own = $this->resource->getRelationValue('tuitionFee');
        if ($own instanceof TuitionFee) {
            return $own;
        }
        $average = $this->resource->institution?->getRelationValue('averageFee');

        return $this->value('level') === 'licenciatura' && $average instanceof TuitionFee ? $average : null;
    }

    /**
     * @return array<string, mixed>|null
     */
    private static function feeShape(?TuitionFee $fee): ?array
    {
        return $fee === null ? null : [
            'monthly' => $fee->getAttribute('monthly_aoa'),
            'basis' => $fee->getAttribute('basis'),
            'year' => $fee->getAttribute('academic_year'),
            'source' => $fee->getAttribute('source'),
        ];
    }
}
