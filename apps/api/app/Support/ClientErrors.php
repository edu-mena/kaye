<?php

namespace App\Support;

use Illuminate\Support\Str;
use Sentry\Event;
use Sentry\Severity;

/**
 * Turns an error the web app reported (POST /client-errors) into a Sentry event. The app never talks to Sentry
 * itself: its strict CSP allows connections only to this site, and the event goes through the same SentryScrubber
 * as the API's own errors, so personal data never leaves (docs/observabilidade.md).
 */
final class ClientErrors
{
    /** Where the error came from in the app: a script error, an unhandled promise, or a React render. */
    public const array SOURCES = ['window', 'promise', 'react'];

    public const int MAX_MESSAGE = 500;

    public const int MAX_STACK = 4_000;

    public static function event(string $message, ?string $stack, string $path, string $source): Event
    {
        $message = self::withoutCards(Str::limit(trim($message), self::MAX_MESSAGE, '…'));

        $event = Event::createEvent();
        $event->setLevel(Severity::error());
        $event->setLogger('web');
        $event->setMessage($message);
        $event->setTags(['layer' => 'web', 'source' => $source, 'page' => self::path($path)]);
        $event->setExtra(array_filter(['stack' => $stack === null ? null : self::withoutCards(Str::limit($stack, self::MAX_STACK, '…'))]));
        // One issue per message, whatever deploy hashed the script names in the stack.
        $event->setFingerprint(['web', $message]);

        return $event;
    }

    /**
     * The page, without anything that could point at a person: no query string or fragment (the app sends only the
     * path, but a forged report could try), and a public card's slug becomes ":slug".
     */
    public static function path(string $path): string
    {
        $path = Str::before(Str::before($path, '?'), '#');
        if (preg_match('#^/[A-Za-z0-9/_.-]{0,200}$#', $path) !== 1) {
            return '/?';
        }

        return self::withoutCards($path);
    }

    /**
     * A public card's address (/c/{slug}) leads to a person's name: wherever it appears, the slug goes.
     */
    private static function withoutCards(string $text): string
    {
        // At the start, after a space or a quote, or after a domain: "/c/x", "(/c/x)", "https://kayeangola.com/c/x".
        return (string) preg_replace('#(^|[\s(\'"]|https?://[^/\s]+)/c/[^/?\#\s)]+#', '$1/c/:slug', $text);
    }
}
