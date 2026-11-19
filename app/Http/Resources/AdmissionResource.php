<?php

namespace App\Http\Resources;

use App\Models\Admission;
use Illuminate\Http\Request;

/**
 * An access exam call of one institution (`Admission`). Loaded: `institution` and `courses`.
 *
 * @extends ContentResource<Admission>
 */
class AdmissionResource extends ContentResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $courses = $this->slugs('courses');

        return self::shape([
            'id' => $this->resource->slug,
            'academyId' => $this->slugOf('institution'),
            'year' => $this->value('academic_year'),
            'registration' => ['start' => $this->date('registration_start'), 'end' => $this->date('registration_end')],
            'examDates' => $this->value('exam_dates'),
            'subjects' => $this->value('subjects'),
            'requirements' => $this->value('requirements'),
            'url' => $this->value('url'),
        ] + $this->sourced(), [
            'courseIds' => $courses === [] ? null : $courses,
            'vacancies' => $this->value('vacancies'),
            'minGrade' => $this->value('min_grade'),
            'minGradeYear' => $this->value('min_grade_year'),
            'fee' => $this->value('fee_aoa'),
        ]);
    }
}
