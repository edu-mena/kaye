<?php

namespace App\Models;

use App\Models\Concerns\HasContentStatus;
use Database\Factories\CompanyFactory;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Translatable\HasTranslations;

/**
 * A real company, only with what the sources confirm (Company). See `companies` in docs/base-de-dados.md.
 */
#[Guarded(['id'])]
class Company extends Model
{
    /** @use HasFactory<CompanyFactory> */
    use HasContentStatus, HasFactory, HasTranslations;

    /**
     * Stored as {"pt": …, "en": …, "fr": …}; a missing language falls back to Portuguese.
     *
     * @var list<string>
     */
    public array $translatable = ['summary', 'programs', 'activities', 'roles'];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'logo_on_dark' => 'boolean',
            'careers_sourced' => 'boolean',
            'groups' => 'array',
            'activities_source' => 'array',
            'founded' => 'array',
            'employees' => 'array',
            'socials' => 'array',
            'people' => 'array',
            'sources' => 'array',
        ];
    }

    /**
     * @return BelongsToMany<Career, $this>
     */
    public function careers(): BelongsToMany
    {
        return $this->belongsToMany(Career::class)->withPivot('position')->orderByPivot('position');
    }

    /**
     * @return BelongsToMany<Institution, $this>
     */
    public function partners(): BelongsToMany
    {
        return $this->belongsToMany(Institution::class)->withPivot('position')->orderByPivot('position');
    }

    /**
     * @return HasMany<Scholarship, $this>
     */
    public function scholarships(): HasMany
    {
        return $this->hasMany(Scholarship::class);
    }

    /**
     * @return HasMany<Internship, $this>
     */
    public function internships(): HasMany
    {
        return $this->hasMany(Internship::class);
    }

    /**
     * @return BelongsToMany<News, $this>
     */
    public function news(): BelongsToMany
    {
        return $this->belongsToMany(News::class);
    }

    /**
     * @return HasMany<Testimonial, $this>
     */
    public function testimonials(): HasMany
    {
        return $this->hasMany(Testimonial::class);
    }
}
