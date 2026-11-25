<?php

namespace App\Models;

use App\Models\Concerns\HasContentStatus;
use App\Models\Concerns\LogsContentChanges;
use Database\Factories\CareerFactory;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Translatable\HasTranslations;

/**
 * A profession: the summary and, once curated, the full guide (CareerSummary and Career). See `careers` in docs/base-de-dados.md.
 */
#[Guarded(['id'])]
class Career extends Model
{
    /** @use HasFactory<CareerFactory> */
    use HasContentStatus, HasFactory, HasTranslations, LogsContentChanges;

    /**
     * Stored as {"pt": …, "en": …, "fr": …}; a missing language falls back to Portuguese.
     *
     * @var list<string>
     */
    public array $translatable = ['name', 'summary', 'description', 'day_to_day', 'work_context', 'work_styles', 'stages', 'market', 'cv_guide', 'self_employment'];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'riasec' => 'array',
            'salary_median' => 'integer',
            'detailed' => 'boolean',
            'image' => 'array',
            'employer_asks' => 'array',
        ];
    }

    /**
     * @return BelongsTo<CareerGroup, $this>
     */
    public function group(): BelongsTo
    {
        return $this->belongsTo(CareerGroup::class, 'career_group_id');
    }

    /**
     * @return BelongsToMany<Skill, $this>
     */
    public function skills(): BelongsToMany
    {
        return $this->belongsToMany(Skill::class)->withPivot('importance', 'position', 'name')->orderByPivot('position');
    }

    /**
     * @return HasMany<Pathway, $this>
     */
    public function pathways(): HasMany
    {
        return $this->hasMany(Pathway::class);
    }

    /**
     * @return HasMany<CvExample, $this>
     */
    public function cvExamples(): HasMany
    {
        return $this->hasMany(CvExample::class);
    }

    /**
     * @return HasMany<Testimonial, $this>
     */
    public function testimonials(): HasMany
    {
        return $this->hasMany(Testimonial::class);
    }

    /**
     * @return HasMany<VideoStory, $this>
     */
    public function videoStories(): HasMany
    {
        return $this->hasMany(VideoStory::class);
    }

    /**
     * @return BelongsToMany<Mentor, $this>
     */
    public function mentors(): BelongsToMany
    {
        return $this->belongsToMany(Mentor::class);
    }

    /**
     * @return BelongsToMany<CourseOffer, $this>
     */
    public function courseOffers(): BelongsToMany
    {
        return $this->belongsToMany(CourseOffer::class);
    }

    /**
     * @return BelongsToMany<Program, $this>
     */
    public function programs(): BelongsToMany
    {
        return $this->belongsToMany(Program::class);
    }

    /**
     * @return BelongsToMany<Company, $this>
     */
    public function companies(): BelongsToMany
    {
        return $this->belongsToMany(Company::class)->withPivot('position');
    }

    /**
     * @return BelongsToMany<FreeCourse, $this>
     */
    public function freeCourses(): BelongsToMany
    {
        return $this->belongsToMany(FreeCourse::class);
    }

    /**
     * @return BelongsToMany<News, $this>
     */
    public function news(): BelongsToMany
    {
        return $this->belongsToMany(News::class);
    }

    /**
     * @return BelongsToMany<Figure, $this>
     */
    public function figures(): BelongsToMany
    {
        return $this->belongsToMany(Figure::class);
    }
}
