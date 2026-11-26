<?php

namespace App\Support;

/**
 * The difference between two texts, word by word, for the side-by-side view of a proposal (Caixa da IA): the words
 * taken out are marked in the text before, the words put in are marked in the text after. Everything is escaped:
 * the AI's text is data, never HTML.
 */
final class TextDiff
{
    /** Beyond this many word pairs the texts are shown whole, without marks (the comparison grows as their product). */
    private const MAX_PAIRS = 250_000;

    /**
     * @return array{before: string, after: string} HTML, escaped, with <del> and <ins>
     */
    public static function words(string $before, string $after): array
    {
        $old = self::tokens($before);
        $new = self::tokens($after);
        if (count($old) * count($new) > self::MAX_PAIRS) {
            return ['before' => e($before), 'after' => e($after)];
        }

        // Longest common subsequence of the words, then walk it back to mark what is not in it.
        $rows = count($old);
        $cols = count($new);
        $lengths = array_fill(0, $rows + 1, array_fill(0, $cols + 1, 0));
        for ($i = $rows - 1; $i >= 0; $i--) {
            for ($j = $cols - 1; $j >= 0; $j--) {
                $lengths[$i][$j] = $old[$i] === $new[$j]
                    ? $lengths[$i + 1][$j + 1] + 1
                    : max($lengths[$i + 1][$j], $lengths[$i][$j + 1]);
            }
        }

        $left = $right = '';
        $i = $j = 0;
        while ($i < $rows || $j < $cols) {
            if ($i < $rows && $j < $cols && $old[$i] === $new[$j]) {
                $left .= e($old[$i]);
                $right .= e($new[$j]);
                $i++;
                $j++;
            } elseif ($j < $cols && ($i === $rows || $lengths[$i][$j + 1] >= $lengths[$i + 1][$j])) {
                $right .= self::mark('ins', $new[$j++]);
            } else {
                $left .= self::mark('del', $old[$i++]);
            }
        }

        return ['before' => $left, 'after' => $right];
    }

    /**
     * Words and the spaces between them, so the text comes back exactly as it was.
     *
     * @return list<string>
     */
    private static function tokens(string $text): array
    {
        if ($text === '') {
            return [];
        }

        return preg_split('/(\s+)/u', $text, -1, PREG_SPLIT_DELIM_CAPTURE | PREG_SPLIT_NO_EMPTY) ?: [$text];
    }

    private static function mark(string $tag, string $token): string
    {
        return trim($token) === '' ? e($token) : "<{$tag}>".e($token)."</{$tag}>";
    }
}
