<?php

namespace App\Import;

use App\Enums\Locale;

/**
 * One exported record in the three languages (database/data/<resource>.<locale>.json, same position in each file).
 * Plain values are read from the Portuguese file; translatable ones with t().
 */
final readonly class Record
{
    /**
     * @param  array<string, array<array-key, mixed>>  $locales  locale => the record in that language
     */
    public function __construct(private array $locales) {}

    public function get(string $key, mixed $default = null): mixed
    {
        return data_get($this->locales[Locale::fallback()->value] ?? [], $key, $default);
    }

    public function has(string $key): bool
    {
        return $this->get($key) !== null;
    }

    public function string(string $key): string
    {
        $value = $this->get($key);
        if (! is_string($value) || $value === '') {
            throw new ImportFailed(["A record has no text in '{$key}'"]);
        }

        return $value;
    }

    public function optionalString(string $key): ?string
    {
        return $this->has($key) ? $this->string($key) : null;
    }

    /**
     * @return list<string>
     */
    public function strings(string $key): array
    {
        $values = $this->get($key, []);

        return is_array($values) ? array_values(array_filter($values, is_string(...))) : [];
    }

    public function t(string $key): Translations
    {
        return new Translations(array_map(fn (array $record): mixed => data_get($record, $key), $this->locales));
    }

    /**
     * A nested list (a career's pathways, an institution's offers), one Record per item.
     *
     * @return list<self>
     */
    public function children(string $key): array
    {
        $lists = array_map(fn (array $record): array => self::list(data_get($record, $key)), $this->locales);

        return array_map(
            fn (int $at): self => new self(array_map(fn (array $list): array => $list[$at] ?? [], $lists)),
            array_keys($lists[Locale::fallback()->value] ?? []),
        );
    }

    /**
     * The arrays of a JSON list; anything else is an empty list.
     *
     * @return list<array<array-key, mixed>>
     */
    public static function list(mixed $value): array
    {
        return is_array($value) ? array_values(array_filter($value, is_array(...))) : [];
    }
}
