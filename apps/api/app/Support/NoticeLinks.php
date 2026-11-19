<?php

namespace App\Support;

use App\Enums\ConsentKind;
use App\Models\Contracts\ReceivesNotices;
use App\Models\User;
use App\Models\WaitlistEntry;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\URL;

/**
 * The signed links in the emails (docs/seguranca.md, "Avisos"): confirming the waiting list's email (double
 * opt-in, valid for a few days) and leaving a kind of email (never expires, works without signing in). The
 * token says who (`user-7`, `waitlist-3`); the signature, made with APP_KEY, stops anyone from changing it.
 */
final class NoticeLinks
{
    public static function confirm(WaitlistEntry $entry): string
    {
        return URL::temporarySignedRoute(
            'waitlist.confirm',
            now()->addDays(Config::integer('kaye.notices.confirmation_days')),
            ['token' => self::token($entry)],
        );
    }

    public static function unsubscribe(ReceivesNotices $who, ConsentKind $kind): string
    {
        return URL::signedRoute('unsubscribe', ['token' => self::token($who), 'kind' => $kind->value]);
    }

    public static function token(ReceivesNotices $who): string
    {
        return str_replace(':', '-', $who->noticeRecipient());
    }

    /**
     * The person a token names, or null when there is no such person (any more).
     */
    public static function resolve(string $token): ?ReceivesNotices
    {
        if (preg_match('/^(user|waitlist)-([1-9]\d{0,18})$/', $token, $match) !== 1) {
            return null;
        }

        return $match[1] === 'user' ? User::query()->find($match[2]) : WaitlistEntry::query()->find($match[2]);
    }
}
