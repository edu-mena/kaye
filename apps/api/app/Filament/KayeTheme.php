<?php

namespace App\Filament;

use Filament\Support\Colors\Color;

/**
 * The panel's colours: the site's tokens (apps/web/src/index.css, docs/design.md "Cores") as Filament palettes.
 * The shades Filament uses for buttons and text are the site's own values; the rest come from Filament's scale.
 *
 * - primary: the main blue of the buttons (`blue` #021D6D, lighter on hover: `blue-dark` #032A96).
 * - gray: the warm greys, from the paper background to `night` and `coal` (the dark mode and the sidebar).
 * - success, danger, warning, info: `success`, `coral`, `gold-ink` and the navy of the brand.
 */
final class KayeTheme
{
    /**
     * @return array<string, array<int, string>>
     */
    public static function colors(): array
    {
        return [
            'primary' => self::palette('#021D6D', [300 => '#AFC0EF', 400 => '#7B96E2', 500 => '#032A96', 600 => '#021D6D', 700 => '#021757']),
            'gray' => self::palette('#66625B', [
                50 => '#F7F4EE', 100 => '#EFEDE9', 200 => '#E2DFD9', 300 => '#CDC9C1', 400 => '#8A857C', 500 => '#66625B',
                600 => '#45423C', 700 => '#36332E', 800 => '#26251F', 900 => '#16171B', 950 => '#0A0A0B',
            ]),
            'success' => self::palette('#1A7A50', [600 => '#1A7A50']),
            'danger' => self::palette('#B33A24', [600 => '#B33A24']),
            'warning' => self::palette('#8A6400', [400 => '#FFC000', 600 => '#8A6400']),
            'info' => self::palette('#1B2A43', [600 => '#1B2A43']),
        ];
    }

    /**
     * Filament's scale for a colour, with the given shades replaced by the site's exact values.
     *
     * @param  array<int, string>  $exact  shade => hex
     * @return array<int, string>
     */
    private static function palette(string $base, array $exact): array
    {
        $palette = Color::hex($base);
        foreach ($exact as $shade => $hex) {
            $palette[$shade] = Color::convertToOklch($hex);
        }

        return $palette;
    }
}
