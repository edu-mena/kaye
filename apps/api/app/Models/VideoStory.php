<?php

namespace App\Models;

use App\Models\Concerns\BelongsToCareer;
use App\Models\Concerns\HasContentStatus;
use Database\Factories\VideoStoryFactory;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Translatable\HasTranslations;

/**
 * "O meu dia como…" (VideoStory): only with written consent, never of minors. See `video_stories` in docs/base-de-dados.md.
 */
#[Guarded(['id'])]
class VideoStory extends Model
{
    /** @use HasFactory<VideoStoryFactory> */
    use BelongsToCareer, HasContentStatus, HasFactory, HasTranslations;

    /**
     * Stored as {"pt": …, "en": …, "fr": …}; a missing language falls back to Portuguese.
     *
     * @var list<string>
     */
    public array $translatable = ['title'];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'duration_seconds' => 'integer',
            'consent_at' => 'date',
            'recorded_at' => 'date',
        ];
    }
}
