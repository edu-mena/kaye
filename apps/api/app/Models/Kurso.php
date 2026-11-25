<?php

namespace App\Models;

use App\Models\Concerns\HasContentStatus;
use App\Models\Concerns\LogsContentChanges;
use Database\Factories\KursoFactory;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Translatable\HasTranslations;

/**
 * A Kurso (ADR 0016), or one announced as "Em breve". See `kursos` in docs/base-de-dados.md.
 */
#[Guarded(['id'])]
class Kurso extends Model
{
    /** @use HasFactory<KursoFactory> */
    use HasContentStatus, HasFactory, HasTranslations, LogsContentChanges;

    /**
     * Stored as {"pt": …, "en": …, "fr": …}; a missing language falls back to Portuguese.
     *
     * @var list<string>
     */
    public array $translatable = ['title', 'subtitle', 'audience', 'goals'];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'credits' => 'array',
            'announced' => 'boolean',
        ];
    }

    /**
     * @return HasMany<KursoUnit, $this>
     */
    public function units(): HasMany
    {
        return $this->hasMany(KursoUnit::class)->orderBy('number');
    }

    /**
     * @return HasMany<KursoExamQuestion, $this>
     */
    public function examQuestions(): HasMany
    {
        return $this->hasMany(KursoExamQuestion::class);
    }
}
