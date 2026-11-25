<?php

namespace App\Models;

use App\Models\Concerns\BelongsToCareer;
use App\Models\Concerns\HasContentStatus;
use App\Models\Concerns\LogsContentChanges;
use Database\Factories\CvExampleFactory;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Translatable\HasTranslations;

/**
 * A model CV of a made-up person (CvExample). See `cv_examples` in docs/base-de-dados.md.
 */
#[Guarded(['id'])]
class CvExample extends Model
{
    /** @use HasFactory<CvExampleFactory> */
    use BelongsToCareer, HasContentStatus, HasFactory, HasTranslations, LogsContentChanges;

    /**
     * Stored as {"pt": …, "en": …, "fr": …}; a missing language falls back to Portuguese.
     *
     * @var list<string>
     */
    public array $translatable = ['why', 'cv', 'notes'];

    /**
     * @return BelongsTo<Pathway, $this>
     */
    public function pathway(): BelongsTo
    {
        return $this->belongsTo(Pathway::class);
    }
}
