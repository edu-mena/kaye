<?php

namespace App\Support;

/**
 * Emails and WhatsApp numbers as the app checks them (apps/web/src/data/waitlist.ts): the same patterns on both
 * sides, so what the form accepts the server accepts.
 */
final class Contact
{
    public const EMAIL = '/^[^\s@]+@[^\s@]+\.[^\s@]+$/';

    public const PHONE = '/^\+?\d{7,16}$/';

    public static function isEmail(string $value): bool
    {
        return preg_match(self::EMAIL, $value) === 1;
    }

    public static function isPhone(string $value): bool
    {
        return preg_match(self::PHONE, $value) === 1;
    }

    /**
     * A WhatsApp number as +244…: accepts spaces, brackets, dots and dashes, and adds +244 to a bare Angolan
     * number (9 digits starting with 9). Null when it is not a number.
     */
    public static function normalisePhone(string $value): ?string
    {
        $digits = (string) preg_replace('/[\s().-]/', '', $value);
        if ($digits === '') {
            return null;
        }
        $full = match (true) {
            preg_match('/^9\d{8}$/', $digits) === 1 => "+244{$digits}",
            str_starts_with($digits, '+') => $digits,
            default => "+{$digits}",
        };

        return self::isPhone($full) ? $full : null;
    }
}
