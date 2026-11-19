<?php

namespace App\Models;

use App\Models\Concerns\HasContentStatus;
use Database\Factories\AssessmentQuestionFactory;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Translatable\HasTranslations;

/**
 * One of the 42 sentences of the vocational test (ADR 0017). See `assessment_questions` in docs/base-de-dados.md.
 */
#[Guarded(['id'])]
class AssessmentQuestion extends Model
{
    /** @use HasFactory<AssessmentQuestionFactory> */
    use HasContentStatus, HasFactory, HasTranslations;

    /**
     * Stored as {"pt": …, "en": …, "fr": …}; a missing language falls back to Portuguese.
     *
     * @var list<string>
     */
    public array $translatable = ['text'];
}
