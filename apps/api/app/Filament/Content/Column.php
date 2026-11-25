<?php

namespace App\Filament\Content;

/**
 * One column of a catalogue table, as the panel edits it (ContentColumns).
 */
final readonly class Column
{
    /** A text in pt, en and fr ({"pt": …}); lists keep a list per language. */
    public const TRANSLATABLE = 'translatable';

    /** A JSON list or object (sources, steps, areas…). */
    public const JSON = 'json';

    public const BOOLEAN = 'boolean';

    public const DATE = 'date';

    public const DATETIME = 'datetime';

    public const INTEGER = 'integer';

    public const DECIMAL = 'decimal';

    /** One line, up to `length` characters. */
    public const STRING = 'string';

    /** Several lines. */
    public const TEXT = 'text';

    /** The key of a parent row (`relation` says which). */
    public const BELONGS_TO = 'belongsTo';

    /** A URL (logo, banner, photo): uploaded with its origin. */
    public const IMAGE = 'image';

    /** A photo with its sizes, alt text and credit (`{thumb, small, large, alt, credit}`). */
    public const PHOTO = 'photo';

    public function __construct(
        public string $name,
        public string $kind,
        public bool $nullable,
        public ?string $default = null,
        public ?int $length = null,
        public ?string $relation = null,
        public bool $unsigned = false,
    ) {}

    /** The form must have a value: the column cannot be empty and has no default. */
    public function required(): bool
    {
        return ! $this->nullable && $this->default === null && $this->kind !== self::BOOLEAN;
    }

    /** An empty value would break the row: the column cannot be empty (its default applies instead). */
    public function keepsValue(): bool
    {
        return ! $this->nullable;
    }

    public function isImage(): bool
    {
        return $this->kind === self::IMAGE || $this->kind === self::PHOTO;
    }
}
