<?php

namespace App\Models;

use App\Models\Concerns\HasContentStatus;
use Database\Factories\SkillFactory;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Spatie\Translatable\HasTranslations;

/**
 * A skill; how much each career needs it lives in career_skill. See `skills` in docs/base-de-dados.md.
 */
#[Guarded(['id'])]
class Skill extends Model
{
    /** @use HasFactory<SkillFactory> */
    use HasContentStatus, HasFactory, HasTranslations;

    /**
     * Stored as {"pt": …, "en": …, "fr": …}; a missing language falls back to Portuguese.
     *
     * @var list<string>
     */
    public array $translatable = ['name'];

    /**
     * @return BelongsToMany<Career, $this>
     */
    public function careers(): BelongsToMany
    {
        return $this->belongsToMany(Career::class)->withPivot('importance', 'position');
    }
}
