<?php

namespace App\Models;

use App\Models\Concerns\BelongsToCareer;
use App\Models\Concerns\HasContentStatus;
use App\Models\Concerns\LogsContentChanges;
use Database\Factories\InterviewQuestionFactory;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Translatable\HasTranslations;

/**
 * A question of the interview practice: general (no area) or of one area. See `interview_questions` in docs/base-de-dados.md.
 */
#[Guarded(['id'])]
class InterviewQuestion extends Model
{
    /** @use HasFactory<InterviewQuestionFactory> */
    use BelongsToCareer, HasContentStatus, HasFactory, HasTranslations, LogsContentChanges;

    /**
     * Stored as {"pt": …, "en": …, "fr": …}; a missing language falls back to Portuguese.
     *
     * @var list<string>
     */
    public array $translatable = ['text', 'goal', 'model', 'mistakes'];
}
