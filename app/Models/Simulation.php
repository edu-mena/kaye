<?php

namespace App\Models;

use App\Models\Concerns\BelongsToCareer;
use App\Models\Concerns\HasContentStatus;
use Database\Factories\SimulationFactory;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Translatable\HasTranslations;

/**
 * A working day of a career, to live through before choosing it: moments with decisions, what the profession asks
 * and the next step. See `simulations` in docs/base-de-dados.md.
 */
#[Guarded(['id'])]
class Simulation extends Model
{
    /** @use HasFactory<SimulationFactory> */
    use BelongsToCareer, HasContentStatus, HasFactory, HasTranslations;

    /**
     * Stored as {"pt": …, "en": …, "fr": …}; a missing language falls back to Portuguese. The lists
     * (`moments`, `asks`, `next_steps`) are kept whole per language.
     *
     * @var list<string>
     */
    public array $translatable = ['title', 'intro', 'moments', 'asks', 'next_steps'];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'minutes' => 'integer',
            'example' => 'boolean',
            'languages' => 'array',
        ];
    }

    /**
     * @return BelongsTo<Agent, $this>
     */
    public function agent(): BelongsTo
    {
        return $this->belongsTo(Agent::class);
    }
}
