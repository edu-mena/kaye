<?php

namespace App\Models;

use App\Models\Concerns\HasContentStatus;
use App\Models\Concerns\LogsContentChanges;
use Database\Factories\SupportProgramFactory;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Translatable\HasTranslations;

/**
 * A programme to start on your own (SupportProgram). See `support_programs` in docs/base-de-dados.md.
 */
#[Guarded(['id'])]
class SupportProgram extends Model
{
    /** @use HasFactory<SupportProgramFactory> */
    use HasContentStatus, HasFactory, HasTranslations, LogsContentChanges;

    /**
     * Stored as {"pt": …, "en": …, "fr": …}; a missing language falls back to Portuguese.
     *
     * @var list<string>
     */
    public array $translatable = ['name', 'audience'];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'min_age' => 'integer',
            'sources' => 'array',
        ];
    }
}
