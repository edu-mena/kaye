<?php

namespace App\Models\Concerns;

use App\Models\Career;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * The careers it is about or prepares for.
 */
trait LinksToCareers
{
    /**
     * @return BelongsToMany<Career, $this>
     */
    public function careers(): BelongsToMany
    {
        return $this->belongsToMany(Career::class);
    }
}
