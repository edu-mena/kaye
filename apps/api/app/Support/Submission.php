<?php

namespace App\Support;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * What the writes without an account share (waiting list, feedback, interviews, public cards): the body read as
 * JSON with a size cap, the honeypot, and answers that no cache keeps and no search engine indexes. The answers
 * are the ones the Vercel functions gave, so the app does not change (docs/arquitetura.md, section 6).
 */
final class Submission
{
    /**
     * The JSON object in the body, or null when it is too long, not JSON or not an object.
     *
     * @return array<string, mixed>|null
     */
    public static function read(Request $request, int $maxLength): ?array
    {
        $body = $request->getContent();
        if (mb_strlen($body) > $maxLength) {
            return null;
        }
        $value = json_decode($body, true);
        if (! is_array($value) || array_is_list($value) && $value !== []) {
            return null;
        }

        /** @var array<string, mixed> $value */
        return $value;
    }

    /**
     * Bots fill every field; people never see `website`. Their request "succeeds" and is dropped.
     *
     * @param  array<string, mixed>  $body
     */
    public static function isBot(array $body): bool
    {
        return is_string($body['website'] ?? null) && $body['website'] !== '';
    }

    /**
     * The app's language when it is one of ours; Portuguese otherwise.
     */
    public static function locale(mixed $value): string
    {
        return is_string($value) && preg_match('/^(pt|en|fr)$/', $value) === 1 ? $value : 'pt';
    }

    /**
     * A string no longer than $max, or absent.
     */
    public static function optionalText(mixed $value, int $max): bool
    {
        return $value === null || is_string($value) && mb_strlen($value) <= $max;
    }

    /**
     * A string with something in it, no longer than $max.
     *
     * @phpstan-assert-if-true string $value
     */
    public static function text(mixed $value, int $max): bool
    {
        return is_string($value) && trim($value) !== '' && mb_strlen($value) <= $max;
    }

    /**
     * A random id safe in a URL, as the Vercel functions made them: 9 bytes give 12 characters.
     *
     * @param  int<1, max>  $bytes
     */
    public static function randomId(int $bytes = 9): string
    {
        return rtrim(strtr(base64_encode(random_bytes($bytes)), '+/', '-_'), '=');
    }

    /**
     * @param  array<array-key, mixed>|null  $body
     */
    public static function json(?array $body, int $status = 200): JsonResponse
    {
        return response()->json($body, $status, [
            // Switching a card off must work at once: nothing may keep an old copy.
            'Cache-Control' => 'no-store',
            'X-Robots-Tag' => 'noindex, nofollow',
        ]);
    }

    public static function invalid(): JsonResponse
    {
        return self::json(['error' => 'invalid'], 422);
    }
}
