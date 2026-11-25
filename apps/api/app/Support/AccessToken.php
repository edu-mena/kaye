<?php

namespace App\Support;

use Illuminate\Http\Request;

/**
 * The shared secrets of the machine routes (the waiting list export, the scrapers' ingest, the detailed health):
 * the token comes in X-Export-Token, X-Ingest-Token, X-Health-Token, a Bearer header or ?token=, and is compared in
 * constant time. A secret shorter than 16 characters, or none, locks the route.
 */
final class AccessToken
{
    public static function allows(Request $request, string $expected): bool
    {
        if (mb_strlen($expected) < 16) {
            return false;
        }
        $given = $request->header('X-Export-Token') ?? $request->header('X-Ingest-Token') ?? $request->header('X-Health-Token') ?? $request->bearerToken() ?? '';
        if ($given === '') {
            $token = $request->query('token');
            $given = is_string($token) ? $token : '';
        }

        return $given !== '' && hash_equals(hash('sha256', $expected), hash('sha256', $given));
    }
}
