<?php

namespace App\Models;

use App\Models\Concerns\HasContentStatus;
use App\Models\Concerns\LogsContentChanges;
use Database\Factories\CourseFactory;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Translatable\HasTranslations;

/**
 * A course in general ("Enfermagem Geral"), offered by several institutions. See `courses` in docs/base-de-dados.md.
 */
#[Guarded(['id'])]
class Course extends Model
{
    /** @use HasFactory<CourseFactory> */
    use HasContentStatus, HasFactory, HasTranslations, LogsContentChanges;

    /**
     * Stored as {"pt": …, "en": …, "fr": …}; a missing language falls back to Portuguese.
     *
     * @var list<string>
     */
    public array $translatable = ['name'];

    /**
     * @return HasMany<CourseOffer, $this>
     */
    public function offers(): HasMany
    {
        return $this->hasMany(CourseOffer::class);
    }

    /**
     * @return BelongsToMany<Admission, $this>
     */
    public function admissions(): BelongsToMany
    {
        return $this->belongsToMany(Admission::class);
    }

    /**
     * @return HasMany<Program, $this>
     */
    public function programs(): HasMany
    {
        return $this->hasMany(Program::class);
    }
}
