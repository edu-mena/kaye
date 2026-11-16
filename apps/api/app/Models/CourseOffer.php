<?php

namespace App\Models;

use App\Models\Concerns\BelongsToCourse;
use App\Models\Concerns\BelongsToInstitution;
use App\Models\Concerns\HasContentStatus;
use App\Models\Concerns\LinksToCareers;
use Database\Factories\CourseOfferFactory;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Spatie\Translatable\HasTranslations;

/**
 * A course at one institution (AcademyOffer). See `course_offers` in docs/base-de-dados.md.
 */
#[Guarded(['id'])]
class CourseOffer extends Model
{
    /** @use HasFactory<CourseOfferFactory> */
    use BelongsToCourse, BelongsToInstitution, HasContentStatus, HasFactory, HasTranslations, LinksToCareers;

    /**
     * Stored as {"pt": …, "en": …, "fr": …}; a missing language falls back to Portuguese.
     *
     * @var list<string>
     */
    public array $translatable = ['name', 'course_name', 'curriculum'];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'recognition' => 'array',
            'groups' => 'array',
            'students' => 'integer',
            'graduates' => 'integer',
        ];
    }

    /**
     * @return HasOne<TuitionFee, $this>
     */
    public function tuitionFee(): HasOne
    {
        return $this->hasOne(TuitionFee::class);
    }
}
