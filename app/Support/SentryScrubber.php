<?php

namespace App\Support;

use Sentry\Breadcrumb;
use Sentry\Event;
use Sentry\EventHint;
use Sentry\ExceptionDataBag;
use Sentry\UserDataBag;

/**
 * Sentry's `before_send` (config/sentry.php): the last door before an error leaves the server. `send_default_pii`
 * is already off; this also takes out what the SDK or our code could still put in an event: the user (except the
 * id), the request body, cookies and secret headers, the query string, and any email, phone number or IP inside
 * a message, an exception or a breadcrumb. docs/seguranca.md: "o Sentry nunca recebe dados pessoais".
 */
final class SentryScrubber
{
    private const REDACTED = '[retirado]';

    /** Headers that are kept: everything else (cookies, tokens, forwarded IPs) goes. */
    private const SAFE_HEADERS = ['accept', 'accept-language', 'content-type', 'content-length', 'user-agent', 'x-request-id'];

    private const PATTERNS = [
        // Emails.
        '/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i',
        // IPv4.
        '/\b(?:\d{1,3}\.){3}\d{1,3}\b/',
        // IPv6 (at least three groups, so a time like 10:30 stays).
        '/\b(?:[0-9a-f]{1,4}:){3,7}[0-9a-f]{1,4}\b/i',
        // Phone numbers: seven or more digits, even with spaces, dots, dashes or brackets (Angola: +244 9xx xxx xxx).
        '/\+?\d[\d\s().-]{6,}\d/',
        // Bearer tokens and secrets in a URL or a message.
        '/(bearer\s+)[A-Za-z0-9._|~+\/=-]+/i',
        '/((?:token|secret|password|key)=)[^&\s]+/i',
    ];

    public static function beforeSend(Event $event, ?EventHint $hint = null): Event
    {
        $user = $event->getUser();
        $event->setUser($user?->getId() === null ? null : new UserDataBag($user->getId()));
        $event->setRequest(self::request($event->getRequest()));
        $event->setServerName(null);

        $message = $event->getMessage();
        if ($message !== null) {
            $event->setMessage(self::text($message), array_map(self::text(...), $event->getMessageParams()));
        }
        $event->setExceptions(array_map(function (ExceptionDataBag $exception): ExceptionDataBag {
            $exception->setValue(self::text($exception->getValue()));

            return $exception;
        }, $event->getExceptions()));
        $event->setBreadcrumb(array_map(self::breadcrumb(...), $event->getBreadcrumbs()));
        $event->setExtra(self::values($event->getExtra()));

        return $event;
    }

    public static function text(string $text): string
    {
        foreach (self::PATTERNS as $pattern) {
            // A pattern with a group keeps it (`Bearer `, `token=`) and hides only what follows.
            $text = (string) preg_replace_callback($pattern, fn (array $match): string => ($match[1] ?? '').self::REDACTED, $text);
        }

        return $text;
    }

    /**
     * @param  array<string, mixed>  $request
     * @return array<string, mixed>
     */
    private static function request(array $request): array
    {
        unset($request['data'], $request['cookies'], $request['env']);
        if (isset($request['query_string'])) {
            $request['query_string'] = self::REDACTED;
        }
        if (isset($request['url']) && is_string($request['url'])) {
            $request['url'] = self::text(strtok($request['url'], '?') ?: $request['url']);
        }
        if (isset($request['headers']) && is_array($request['headers'])) {
            $request['headers'] = array_filter(
                $request['headers'],
                fn (string|int $name): bool => in_array(strtolower((string) $name), self::SAFE_HEADERS, true),
                ARRAY_FILTER_USE_KEY,
            );
        }

        return $request;
    }

    private static function breadcrumb(Breadcrumb $breadcrumb): Breadcrumb
    {
        $message = $breadcrumb->getMessage();
        if ($message !== null) {
            $breadcrumb = $breadcrumb->withMessage(self::text($message));
        }
        foreach ($breadcrumb->getMetadata() as $name => $value) {
            $breadcrumb = $breadcrumb->withMetadata((string) $name, is_string($value) ? self::text($value) : (is_array($value) ? self::values($value) : $value));
        }

        return $breadcrumb;
    }

    /**
     * @template TKey of array-key
     *
     * @param  array<TKey, mixed>  $values
     * @return array<TKey, mixed>
     */
    private static function values(array $values): array
    {
        return array_map(fn (mixed $value): mixed => match (true) {
            is_string($value) => self::text($value),
            is_array($value) => self::values($value),
            default => $value,
        }, $values);
    }
}
