<?php

namespace App\Models\Concerns;

use App\Support\PublicContent;

/**
 * Any change to a row of the content clears the cached answers of the public API (App\Support\PublicContent).
 * Link tables change without model events: whoever syncs them flushes too (the importer does).
 */
trait FlushesPublicContent
{
    public static function bootFlushesPublicContent(): void
    {
        static::saved(fn (): null => PublicContent::flush());
        static::deleted(fn (): null => PublicContent::flush());
    }
}
