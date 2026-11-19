<?php

namespace App\Import;

use Closure;
use Illuminate\Database\Eloquent\Model;

/**
 * One resource of the import (one line of its report): a model, the columns that identify a row and how to
 * read the rows.
 */
final readonly class Target
{
    /**
     * @param  class-string<Model>  $model
     * @param  list<string>  $key  the columns that identify a row (the slug, or the slug within its parent)
     * @param  Closure(Importer): iterable<Row>  $rows
     */
    public function __construct(
        public string $name,
        public string $model,
        public Closure $rows,
        public array $key = ['slug'],
    ) {}
}
