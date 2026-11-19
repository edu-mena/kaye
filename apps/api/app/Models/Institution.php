<?php

namespace App\Models;

use App\Models\Concerns\HasContentStatus;
use Database\Factories\InstitutionFactory;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Spatie\Translatable\HasTranslations;

/**
 * A school (Academy), or a made-up "Exemplo" one behind the programs (example). See `institutions` in docs/base-de-dados.md.
 */
#[Guarded(['id'])]
class Institution extends Model
{
    /** @use HasFactory<InstitutionFactory> */
    use HasContentStatus, HasFactory, HasTranslations;

    /**
     * Stored as {"pt": …, "en": …, "fr": …}; a missing language falls back to Portuguese.
     *
     * @var list<string>
     */
    public array $translatable = ['summary'];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'min_age' => 'integer',
            'social' => 'array',
            'founded' => 'array',
            'recognized_by' => 'array',
            'sources' => 'array',
            'example' => 'boolean',
        ];
    }

    /**
     * @return HasMany<CourseOffer, $this>
     */
    public function courseOffers(): HasMany
    {
        return $this->hasMany(CourseOffer::class);
    }

    /**
     * @return HasMany<TuitionFee, $this>
     */
    public function tuitionFees(): HasMany
    {
        return $this->hasMany(TuitionFee::class);
    }

    /**
     * The average fee of the institution's licenciaturas, stored once without an offer (docs/base-de-dados.md).
     *
     * @return HasOne<TuitionFee, $this>
     */
    public function averageFee(): HasOne
    {
        return $this->hasOne(TuitionFee::class)->whereNull('course_offer_id');
    }

    /**
     * @return HasMany<Admission, $this>
     */
    public function admissions(): HasMany
    {
        return $this->hasMany(Admission::class);
    }

    /**
     * @return HasMany<Program, $this>
     */
    public function programs(): HasMany
    {
        return $this->hasMany(Program::class);
    }

    /**
     * @return BelongsToMany<Company, $this>
     */
    public function companies(): BelongsToMany
    {
        return $this->belongsToMany(Company::class);
    }
}
