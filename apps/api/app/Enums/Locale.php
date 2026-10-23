<?php

namespace App\Enums;

/**
 * Languages the product is available in. The first case is the fallback.
 */
enum Locale: string
{
    case Pt = 'pt';
    case En = 'en';
    case Fr = 'fr';

    public static function fallback(): self
    {
        return self::Pt;
    }

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_map(fn (self $locale): string => $locale->value, self::cases());
    }
}
