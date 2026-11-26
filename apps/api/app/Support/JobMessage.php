<?php

namespace App\Support;

use App\Models\Dataset;
use App\Models\JobPosting;
use Illuminate\Support\Str;

/**
 * "Colar vaga" (Moderação): a job ad that arrived by WhatsApp becomes the facts of a job post, like the scrapers'
 * (docs/fontes-de-vagas.md). read() suggests the facts from the text; the team checks them and save() keeps them.
 * The text itself is never stored: only the facts feed the Mercado counts.
 */
final class JobMessage
{
    public const SOURCE = 'whatsapp';

    /**
     * The facts the message seems to have: the title (its first line), the first link, the province, the company
     * and how many openings.
     *
     * @return array{title: string|null, url: string|null, province: string|null, company: string|null, openings: int|null}
     */
    public static function read(string $text): array
    {
        $lines = array_values(array_filter(array_map(
            fn (string $line): string => trim(preg_replace('/[*_~]/u', '', $line) ?? ''),
            preg_split('/\R/u', $text) ?: [],
        ), fn (string $line): bool => $line !== ''));

        $province = null;
        foreach (self::provinces() as $name) {
            if (preg_match('/\b'.preg_quote($name, '/').'\b/iu', $text) === 1) {
                $province = $name;
                break;
            }
        }
        $company = preg_match('/(?:empresa|entidade|empregador)\s*[:\-–]\s*(.+)/iu', $text, $match) === 1 ? trim($match[1]) : null;
        $openings = preg_match('/(\d{1,4})\s+vagas?\b/iu', $text, $count) === 1 ? (int) $count[1] : null;
        $url = preg_match('#https?://[^\s<>"]+#iu', $text, $link) === 1 ? rtrim($link[0], '.,;)') : null;

        return [
            'title' => isset($lines[0]) ? Str::limit($lines[0], 500, '') : null,
            'url' => $url,
            'province' => $province,
            'company' => $company === null ? null : Str::limit($company, 255, ''),
            'openings' => $openings,
        ];
    }

    /**
     * Keeps the facts (the same post twice is updated, not counted twice).
     *
     * @param  array{title: string, url: string, date: string, province?: string|null, company?: string|null, sector?: string|null, career?: string|null, kind?: string|null, openings?: int|null}  $facts
     */
    public static function save(array $facts): JobPosting
    {
        $key = Str::lower(trim($facts['title'])).'|'.Str::lower(trim((string) ($facts['company'] ?? ''))).'|'.$facts['date'];

        return JobPosting::query()->updateOrCreate(
            ['external_id' => self::SOURCE.':'.substr(hash('sha256', $key), 0, 24)],
            [
                'source' => self::SOURCE,
                'date' => $facts['date'],
                'url' => $facts['url'],
                'title' => $facts['title'],
                'kind' => $facts['kind'] ?? null,
                'company' => $facts['company'] ?? null,
                'province' => $facts['province'] ?? null,
                'sector' => $facts['sector'] ?? null,
                'career' => $facts['career'] ?? null,
                'openings' => $facts['openings'] ?? null,
            ],
        );
    }

    /**
     * Angola's provinces, longest first ("Lunda Norte" before "Lunda").
     *
     * @return list<string>
     */
    public static function provinces(): array
    {
        $stored = Dataset::query()->where('slug', 'provinces')->value('data');
        $list = is_string($stored) ? json_decode($stored, true) : $stored;
        $names = array_values(array_filter(is_array($list) ? $list : [], 'is_string'));
        usort($names, fn (string $a, string $b): int => mb_strlen($b) <=> mb_strlen($a));

        return $names;
    }
}
