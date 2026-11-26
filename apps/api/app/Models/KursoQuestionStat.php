<?php

namespace App\Models;

use App\Models\Concerns\LogsContentChanges;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Model;

/**
 * How many times a question was answered and how many rightly. Counters only: never who (ADR 0025).
 *
 * @property string $course
 * @property string $question_id
 * @property int $answered
 * @property int $correct
 */
#[Guarded(['id'])]
class KursoQuestionStat extends Model
{
    use LogsContentChanges;

    public $timestamps = false;

    /** Under this many answers the rate says nothing. */
    public const MIN_ANSWERS = 20;

    public function errorRate(): float
    {
        return $this->answered === 0 ? 0.0 : ($this->answered - $this->correct) / $this->answered;
    }
}
