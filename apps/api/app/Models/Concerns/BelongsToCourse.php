<?php

namespace App\Models\Concerns;

use App\Models\Course;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * The course (in general) it is an offer of.
 */
trait BelongsToCourse
{
    /**
     * @return BelongsTo<Course, $this>
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }
}
