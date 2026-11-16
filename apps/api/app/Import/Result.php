<?php

namespace App\Import;

/**
 * The counts of one resource. When it fails, nothing of it was written (its transaction rolled back).
 */
final class Result
{
    public int $read = 0;

    public int $created = 0;

    public int $updated = 0;

    /** @var list<string> */
    public array $problems = [];

    public function __construct(public readonly string $name) {}

    /**
     * @param  list<string>  $problems
     */
    public function fail(array $problems): void
    {
        $this->created = 0;
        $this->updated = 0;
        $this->problems = $problems;
    }

    public function failed(): bool
    {
        return $this->problems !== [];
    }
}
