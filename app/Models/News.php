<?php

namespace App\Models;

use App\Models\Concerns\HasContentStatus;
use App\Models\Concerns\LinksToCareers;
use Database\Factories\NewsFactory;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Spatie\Translatable\HasTranslations;

/**
 * A piece of news (NewsItem). See `news` in docs/base-de-dados.md.
 */
#[Guarded(['id'])]
class News extends Model
{
    /** @use HasFactory<NewsFactory> */
    use HasContentStatus, HasFactory, HasTranslations, LinksToCareers;

    /**
     * Stored as {"pt": …, "en": …, "fr": …}; a missing language falls back to Portuguese.
     *
     * @var list<string>
     */
    public array $translatable = ['title', 'summary', 'body'];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'date' => 'date',
            'image' => 'array',
            'source' => 'array',
            'example' => 'boolean',
        ];
    }

    /**
     * @return BelongsToMany<Company, $this>
     */
    public function companies(): BelongsToMany
    {
        return $this->belongsToMany(Company::class)->withPivot('position')->orderByPivot('position');
    }

    /**
     * @return BelongsToMany<Area, $this>
     */
    public function areas(): BelongsToMany
    {
        return $this->belongsToMany(Area::class);
    }

    /**
     * @return BelongsToMany<Institution, $this>
     */
    public function institutions(): BelongsToMany
    {
        return $this->belongsToMany(Institution::class);
    }

    /**
     * @return HasOne<NewsEvent, $this>
     */
    public function event(): HasOne
    {
        return $this->hasOne(NewsEvent::class);
    }
}
