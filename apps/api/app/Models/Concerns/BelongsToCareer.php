<?php

namespace App\Models\Concerns;

use App\Models\Career;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * The career it belongs to.
 */
trait BelongsToCareer
{
    /**
     * @return BelongsTo<Career, $this>
     */
    public function career(): BelongsTo
    {
        return $this->belongsTo(Career::class);
    }
}
