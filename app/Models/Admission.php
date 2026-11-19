<?php

namespace App\Models;

use App\Models\Concerns\BelongsToInstitution;
use App\Models\Concerns\HasContentStatus;
use Database\Factories\AdmissionFactory;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Spatie\Translatable\HasTranslations;

/**
 * Access to higher education (Admission): one institution's exam, or the national calendar. See `admissions` in docs/base-de-dados.md.
 */
#[Guarded(['id'])]
class Admission extends Model
{
    /** @use HasFactory<AdmissionFactory> */
    use BelongsToInstitution, HasContentStatus, HasFactory, HasTranslations;

    /**
     * Stored as {"pt": …, "en": …, "fr": …}; a missing language falls back to Portuguese.
     *
     * @var list<string>
     */
    public array $translatable = ['subjects', 'requirements'];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'registration_start' => 'date',
            'registration_end' => 'date',
            'exam_dates' => 'array',
            'vacancies' => 'integer',
            'min_grade' => 'float',
            'fee_aoa' => 'integer',
            'sources' => 'array',
        ];
    }

    /**
     * @return BelongsToMany<Course, $this>
     */
    public function courses(): BelongsToMany
    {
        return $this->belongsToMany(Course::class)->withPivot('position')->orderByPivot('position');
    }
}
