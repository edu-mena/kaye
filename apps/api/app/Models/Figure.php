<?php

namespace App\Models;

use App\Models\Concerns\HasContentStatus;
use App\Models\Concerns\LinksToCareers;
use Database\Factories\FigureFactory;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Translatable\HasTranslations;

/**
 * A figure of the week (Figure): a real person, with the role confirmed by a source. See `figures` in docs/base-de-dados.md.
 */
#[Guarded(['id'])]
class Figure extends Model
{
    /** @use HasFactory<FigureFactory> */
    use HasContentStatus, HasFactory, HasTranslations, LinksToCareers;

    /**
     * Stored as {"pt": …, "en": …, "fr": …}; a missing language falls back to Portuguese.
     *
     * @var list<string>
     */
    public array $translatable = ['role', 'why'];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'follow' => 'array',
            'source' => 'array',
        ];
    }
}
