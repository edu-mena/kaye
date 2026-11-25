<?php

namespace App\Models;

use App\Models\Concerns\HasContentStatus;
use App\Models\Concerns\LogsContentChanges;
use Database\Factories\AccessExamQuestionFactory;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * An original question of the access exams bank (Portuguese only). See `access_exam_questions` in docs/base-de-dados.md.
 */
#[Guarded(['id'])]
class AccessExamQuestion extends Model
{
    /** @use HasFactory<AccessExamQuestionFactory> */
    use HasContentStatus, HasFactory, LogsContentChanges;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'options' => 'array',
            'answer' => 'integer',
        ];
    }
}
