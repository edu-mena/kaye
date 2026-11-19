<?php

namespace App\Models;

use App\Models\Concerns\BelongsToKurso;
use App\Models\Concerns\HasContentStatus;
use Database\Factories\KursoExamQuestionFactory;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A question of a Kurso's final exam. The slug is unique within its Kurso. See `kurso_exam_questions` in docs/base-de-dados.md.
 */
#[Guarded(['id'])]
class KursoExamQuestion extends Model
{
    /** @use HasFactory<KursoExamQuestionFactory> */
    use BelongsToKurso, HasContentStatus, HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'options' => 'array',
            'answer' => 'integer',
            'answers' => 'array',
        ];
    }

    /**
     * @return BelongsTo<KursoUnit, $this>
     */
    public function unit(): BelongsTo
    {
        return $this->belongsTo(KursoUnit::class, 'kurso_unit_id');
    }
}
