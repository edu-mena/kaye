<?php

namespace App\Support;

use RuntimeException;

/**
 * A proposal or a review that cannot go ahead: what is wrong, in words the AI (or the person) can act on.
 */
final class InvalidProposal extends RuntimeException
{
    /**
     * @param  list<string>  $problems
     */
    public function __construct(public readonly array $problems)
    {
        parent::__construct(implode(' ', $problems));
    }
}
