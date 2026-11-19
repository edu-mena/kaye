<?php

namespace App\Import;

use RuntimeException;

/**
 * The import stopped: every problem found, so they can all be fixed in one go.
 */
final class ImportFailed extends RuntimeException
{
    /**
     * @param  list<string>  $problems
     */
    public function __construct(public readonly array $problems)
    {
        parent::__construct(implode("\n", $problems));
    }
}
