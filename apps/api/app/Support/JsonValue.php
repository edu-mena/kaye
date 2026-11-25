<?php

namespace App\Support;

/**
 * Values read from decoded JSON (the Claude API, the AI's tool inputs), made typed without trusting them.
 */
final class JsonValue
{
    public static function int(mixed $value): int
    {
        return is_numeric($value) ? (int) $value : 0;
    }

    public static function float(mixed $value): float
    {
        return is_numeric($value) ? (float) $value : 0.0;
    }

    public static function string(mixed $value): string
    {
        return is_string($value) ? $value : '';
    }

    /**
     * An object: its string keys and their values; anything else is empty.
     *
     * @return array<string, mixed>
     */
    public static function map(mixed $value): array
    {
        if (! is_array($value)) {
            return [];
        }
        $map = [];
        foreach ($value as $key => $item) {
            if (is_string($key)) {
                $map[$key] = $item;
            }
        }

        return $map;
    }

    /**
     * A list: its values in order; anything else is empty.
     *
     * @return list<mixed>
     */
    public static function list(mixed $value): array
    {
        return is_array($value) ? array_values($value) : [];
    }
}
