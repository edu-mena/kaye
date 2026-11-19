<?php

namespace App\Models;

use App\Models\Concerns\HasContentStatus;
use App\Models\Concerns\LinksToCareers;
use Database\Factories\MentorFactory;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Translatable\HasTranslations;

/**
 * An approved volunteer mentor (Mentor). See `mentors` in docs/base-de-dados.md.
 */
#[Guarded(['id'])]
class Mentor extends Model
{
    /** @use HasFactory<MentorFactory> */
    use HasContentStatus, HasFactory, HasTranslations, LinksToCareers;

    /**
     * Stored as {"pt": …, "en": …, "fr": …}; a missing language falls back to Portuguese.
     *
     * @var list<string>
     */
    public array $translatable = ['bio'];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'languages' => 'array',
            'consent_at' => 'date',
        ];
    }
}
