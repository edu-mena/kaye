<?php

namespace App\Models;

use App\Models\Concerns\BelongsToCompany;
use App\Models\Concerns\HasContentStatus;
use App\Models\Concerns\LogsContentChanges;
use Database\Factories\ScholarshipFactory;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Translatable\HasTranslations;

/**
 * A real scholarship (Scholarship). See `scholarships` in docs/base-de-dados.md.
 */
#[Guarded(['id'])]
class Scholarship extends Model
{
    /** @use HasFactory<ScholarshipFactory> */
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
            'levels' => 'array',
            'areas' => 'array',
            'covers' => 'array',
            'min_age' => 'integer',
            'max_age' => 'integer',
            'deadline' => 'date',
            'recurring' => 'boolean',
            'sources' => 'array',
        ];
    }
}
