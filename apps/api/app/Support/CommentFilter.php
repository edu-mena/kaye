<?php

namespace App\Support;

use Illuminate\Support\Str;

/**
 * The automatic filter of the comments: swearing, phone numbers, emails and links are refused. It answers the
 * reason, never the part that matched.
 */
final class CommentFilter
{
    /** @var list<string> Without accents, lowercase; matched as whole words after undoing 0/1/3/4/5 for letters. */
    private const array SWEARING = [
        'puta', 'puto', 'putas', 'merda', 'caralho', 'foda', 'foder', 'fodase', 'fodasse', 'fdp', 'cona', 'cu',
        'buceta', 'viado', 'paneleiro', 'cabrao', 'bosta', 'porra', 'arrombado', 'vadia', 'corno', 'cornos',
        'filho da puta', 'filha da puta', 'vai-te foder', 'vai te foder',
    ];

    /** @return 'empty'|'too_long'|'email'|'link'|'phone'|'swearing'|null */
    public static function refusal(string $text): ?string
    {
        $text = trim($text);
        if ($text === '') {
            return 'empty';
        }
        if (mb_strlen($text) > 500) {
            return 'too_long';
        }
        if (preg_match('/[^\s@]+\s?(@|\(at\)|\[at\]|arroba)\s?[^\s@]+\s?(\.|\(dot\)|ponto)\s?[a-z]{2,}/iu', $text) === 1) {
            return 'email';
        }
        if (preg_match('~(https?://|www\.|\b[a-z0-9-]+\.(com|net|org|ao|co|pt|br|me|io|ly|gl|xyz|info|app|tv)\b)~iu', $text) === 1) {
            return 'link';
        }
        // Seven or more digits, even spread out with spaces, dots, dashes or brackets.
        if (preg_match('/(?:\+?\d[\s().\-]*){7,}/u', $text) === 1) {
            return 'phone';
        }
        if (self::swears($text)) {
            return 'swearing';
        }

        return null;
    }

    private static function swears(string $text): bool
    {
        $plain = mb_strtolower(Str::ascii($text));
        $plain = strtr($plain, ['0' => 'o', '1' => 'i', '3' => 'e', '4' => 'a', '5' => 's', '@' => 'a', '$' => 's']);
        // "puuuuta" is "puta".
        $plain = (string) preg_replace('/(\p{L})\1{2,}/u', '$1', $plain);
        foreach (self::SWEARING as $word) {
            if (preg_match('/(?<![a-z])'.preg_quote($word, '/').'(?![a-z])/', $plain) === 1) {
                return true;
            }
        }

        return false;
    }
}
