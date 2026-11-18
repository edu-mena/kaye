<?php

namespace App\Filament\Resources\Messages\Pages;

/**
 * What the message form saves: empty translations dropped (Portuguese stands in for them), and an audience
 * the Audience class reads (lists of strings; `waitlist` only for a service email, where it is offered).
 */
final class MessageForm
{
    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    public static function clean(array $data): array
    {
        $audience = is_array($data['audience'] ?? null) ? $data['audience'] : [];
        $serviceEmail = ($data['channel'] ?? null) === 'email' && ($data['purpose'] ?? null) === 'service';

        return [
            ...$data,
            'subject' => self::texts($data['subject'] ?? []),
            'body' => self::texts($data['body'] ?? []),
            'audience' => [
                'provinces' => self::strings($audience['provinces'] ?? []),
                'areas' => self::strings($audience['areas'] ?? []),
                'waitlist' => $serviceEmail && ($audience['waitlist'] ?? false) === true,
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    private static function texts(mixed $value): array
    {
        $texts = [];
        foreach (is_array($value) ? $value : [] as $locale => $text) {
            if (is_string($locale) && is_string($text) && trim($text) !== '') {
                $texts[$locale] = trim($text);
            }
        }

        return $texts;
    }

    /**
     * @return list<string>
     */
    private static function strings(mixed $value): array
    {
        return array_values(array_filter(is_array($value) ? $value : [], fn (mixed $item): bool => is_string($item) && $item !== ''));
    }
}
