<?php

namespace App\Support;

use App\Models\Feedback;
use App\Models\WaitlistEntry;
use Illuminate\Support\Carbon;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * The waiting list or the feedback as CSV, for a spreadsheet: the same columns and format the Vercel function
 * gave. Downloaded from the admin panel or from GET /api/v1/waitlist/export with WAITLIST_EXPORT_TOKEN.
 */
final class ListExport
{
    public const KINDS = ['waitlist', 'feedback'];

    public static function filename(string $kind): string
    {
        return "kaye-{$kind}-".now()->utc()->toDateString().'.csv';
    }

    public static function download(string $kind): StreamedResponse
    {
        $csv = self::csv($kind);

        return response()->streamDownload(function () use ($csv): void {
            echo $csv;
        }, self::filename($kind), [
            'Content-Type' => 'text/csv; charset=utf-8',
            'Cache-Control' => 'no-store',
            'X-Robots-Tag' => 'noindex, nofollow',
        ]);
    }

    /**
     * With a BOM, so Excel reads the accents, and CRLF line ends. Oldest first, as the list was kept.
     */
    public static function csv(string $kind): string
    {
        [$header, $rows] = $kind === 'feedback'
            ? [['date', 'kind', 'page', 'lang', 'message'], self::feedbackRows()]
            : [['date', 'source', 'name', 'email', 'whatsapp', 'lang'], self::waitlistRows()];
        $lines = [implode(',', $header)];
        foreach ($rows as $row) {
            $lines[] = implode(',', array_map(self::cell(...), $row));
        }

        return "\u{FEFF}".implode("\r\n", $lines)."\r\n";
    }

    /**
     * One CSV cell. A leading = + - @ tab or CR is neutralised, so a spreadsheet never runs it as a formula;
     * a phone number (+244…) is left alone.
     */
    public static function cell(string $text): string
    {
        if (preg_match('/^[=+\-@\t\r]/', $text) === 1 && ! Contact::isPhone($text)) {
            $text = "'{$text}";
        }

        return '"'.str_replace('"', '""', $text).'"';
    }

    /**
     * As JavaScript's toISOString(), which the Vercel lists used: 2026-11-13T10:00:00.000Z.
     */
    public static function isoDate(Carbon $date): string
    {
        return $date->copy()->utc()->format('Y-m-d\TH:i:s.v\Z');
    }

    /**
     * @return list<list<string>>
     */
    private static function waitlistRows(): array
    {
        $rows = [];
        foreach (WaitlistEntry::query()->lazyById() as $entry) {
            $rows[] = [
                self::isoDate($entry->created_at),
                $entry->source,
                $entry->name,
                $entry->email ?? '',
                $entry->whatsapp ?? '',
                $entry->locale,
            ];
        }

        return $rows;
    }

    /**
     * @return list<list<string>>
     */
    private static function feedbackRows(): array
    {
        $rows = [];
        foreach (Feedback::query()->lazyById() as $feedback) {
            $rows[] = [
                self::isoDate($feedback->created_at),
                $feedback->kind,
                $feedback->page,
                $feedback->locale,
                $feedback->message,
            ];
        }

        return $rows;
    }
}
