<?php

namespace App\Models\Concerns;

use App\Models\Kurso;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * The Kurso it is part of.
 */
trait BelongsToKurso
{
    /**
     * @return BelongsTo<Kurso, $this>
     */
    public function kurso(): BelongsTo
    {
        return $this->belongsTo(Kurso::class);
    }
}
