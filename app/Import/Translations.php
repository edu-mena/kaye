<?php

namespace App\Import;

use App\Enums\Locale;

/**
 * One field in the three languages, for a translatable column. A language that only repeats the Portuguese
 * is left out: the model falls back to Portuguese, and the AI translation fills it later (ADR 0019).
 */
final readonly class Translations
{
    /**
     * @param  array<string, mixed>  $values  locale => value
     */
    public function __construct(private array $values) {}

    /**
     * What the column stores, or null when there is no Portuguese value.
     *
     * @return array<string, mixed>|null
     */
    public function stored(): ?array
    {
        $fallback = Locale::fallback()->value;
        $source = $this->values[$fallback] ?? null;
        if ($source === null) {
            return null;
        }

        return array_filter(
            $this->values,
            fn (mixed $value, string $locale): bool => $locale === $fallback || ($value !== null && $value !== $source),
            ARRAY_FILTER_USE_BOTH,
        );
    }
}
