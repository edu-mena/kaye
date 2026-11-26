<?php

namespace App\Models;

use App\Models\Concerns\BelongsToCompany;
use App\Models\Concerns\HasContentStatus;
use App\Models\Concerns\LogsContentChanges;
use Database\Factories\InternshipFactory;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Translatable\HasTranslations;

/**
 * A real internship or trainee programme (Internship). See `internships` in docs/base-de-dados.md.
 */
#[Guarded(['id'])]
class Internship extends Model
{
    /** @use HasFactory<InternshipFactory> */
    use BelongsToCompany, HasContentStatus, HasFactory, HasTranslations, LogsContentChanges;

    /**
     * Stored as {"pt": …, "en": …, "fr": …}; a missing language falls back to Portuguese.
     *
     * @var list<string>
     */
    public array $translatable = ['name', 'requirements'];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'areas' => 'array',
            'audience' => 'array',
            'min_age' => 'integer',
            'max_age' => 'integer',
            'paid' => 'boolean',
            'duration_months' => 'integer',
            'deadline' => 'date',
            'recurring' => 'boolean',
            'sources' => 'array',
        ];
    }
}
