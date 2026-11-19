<?php

namespace App\Models;

use App\Models\Concerns\BelongsToCareer;
use App\Models\Concerns\HasContentStatus;
use Database\Factories\PathwayFactory;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Translatable\HasTranslations;

/**
 * A way into a career (Pathway). The slug is unique within its career. See `pathways` in docs/base-de-dados.md.
 */
#[Guarded(['id'])]
class Pathway extends Model
{
    /** @use HasFactory<PathwayFactory> */
    use BelongsToCareer, HasContentStatus, HasFactory, HasTranslations;

    /**
     * Stored as {"pt": …, "en": …, "fr": …}; a missing language falls back to Portuguese.
     *
     * @var list<string>
     */
    public array $translatable = ['name', 'summary', 'steps'];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'total_cost_min' => 'integer',
            'total_cost_max' => 'integer',
        ];
    }

    /**
     * @return HasMany<CvExample, $this>
     */
    public function cvExamples(): HasMany
    {
        return $this->hasMany(CvExample::class);
    }
}
