<?php

namespace App\Support\Seo;

use Illuminate\Support\Facades\File;

/**
 * Finds a catalogue picture in the built web app. The rows point at the sources (/src/assets/careers/actor-800.webp);
 * Vite copied them to public/spa/assets with a hash in the name (actor-800-AbC123.webp).
 */
final class SeoImages
{
    /**
     * @var array<string, string>|null
     */
    private static ?array $built = null;

    public static function find(string $name, string $extension): ?string
    {
        if (self::$built === null) {
            self::$built = [];
            foreach (File::glob(public_path('spa/assets/*')) as $file) {
                if (is_string($file) && preg_match('/^(.+)-[A-Za-z0-9_-]{8}\.([a-z0-9]+)$/', basename($file), $match) === 1) {
                    self::$built[$match[1].'.'.$match[2]] = '/spa/assets/'.basename($file);
                }
            }
        }

        return self::$built[$name.'.'.$extension] ?? null;
    }

    /**
     * Forgets what it found (a new build, or a test that writes its own files).
     */
    public static function forget(): void
    {
        self::$built = null;
    }
}
