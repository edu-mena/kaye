<?php

namespace App\Models;

use App\Models\Concerns\BelongsToUser;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * A topic (a unit of a Kurso, or `exam`) a person finished, on the local day the app sent (ADR 0025).
 *
 * @property string $course
 * @property string $topic
 * @property Carbon $completed_on Y-m-d
 * @property float|null $score
 */
#[Guarded(['id'])]
class KursoCompletion extends Model
{
    use BelongsToUser;

    /** The `topic` of the final exam: it never counts for the daily limit. */
    public const EXAM = 'exam';

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['completed_on' => 'date:Y-m-d', 'score' => 'float'];
    }
}
