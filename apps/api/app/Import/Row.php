<?php

namespace App\Import;

use Closure;
use Illuminate\Database\Eloquent\Model;

/**
 * One row to write: its columns, what only a new row gets, and the links to sync after it is saved.
 */
final readonly class Row
{
    /**
     * @param  array<string, mixed>  $values  column => value; a translatable column takes Translations
     * @param  array<string, mixed>  $onCreate  columns set only when the row is new (the status: publishing is editorial)
     * @param  (Closure(Model): bool)|null  $links  syncs the link tables; true when something changed
     */
    public function __construct(
        public array $values,
        public array $onCreate = [],
        public ?Closure $links = null,
    ) {}
}
