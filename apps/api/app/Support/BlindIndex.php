<?php

namespace App\Support;

use Illuminate\Support\Facades\Config;
use Illuminate\Support\Str;

/**
 * The searchable twin of an encrypted column (a "blind index"): a keyed hash of the normalised value, so the same
 * email always gives the same hash and the database can find it, but nobody without the APP_KEY can turn a hash
 * back into an email, nor test guesses against it. Rotating the APP_KEY means recomputing these columns:
 * APP_PREVIOUS_KEYS still decrypts the values, but the hashes are made with the current key.
 */
final class BlindIndex
{
    public static function of(string $column, ?string $value): ?string
    {
        if ($value === null || trim($value) === '') {
            return null;
        }

        return hash_hmac('sha256', $column.'|'.Str::lower(trim($value)), Config::string('app.key'));
    }
}
