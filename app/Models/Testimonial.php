<?php

namespace App\Models;

use App\Models\Concerns\BelongsToCareer;
use App\Models\Concerns\BelongsToCompany;
use App\Models\Concerns\HasContentStatus;
use App\Models\Concerns\LogsContentChanges;
use Database\Factories\TestimonialFactory;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Translatable\HasTranslations;

/**
 * "Como cheguei aqui" (Testimonial): the made-up ones are never of real people. See `testimonials` in docs/base-de-dados.md.
 */
#[Guarded(['id'])]
class Testimonial extends Model
{
    /** @use HasFactory<TestimonialFactory> */
    use BelongsToCareer, BelongsToCompany, HasContentStatus, HasFactory, HasTranslations, LogsContentChanges;

    /**
     * Stored as {"pt": …, "en": …, "fr": …}; a missing language falls back to Portuguese.
     *
     * @var list<string>
     */
    public array $translatable = ['role', 'path', 'tip'];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'years' => 'integer',
            'source' => 'array',
            'example' => 'boolean',
        ];
    }
}
