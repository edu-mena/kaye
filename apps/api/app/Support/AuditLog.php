<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Request;
use Illuminate\Support\Str;
use Spatie\Activitylog\Models\Activity;

/**
 * The audit log (`activity_log`, docs/seguranca.md, "Auditoria"), besides the content changes that the models log
 * by themselves (`LogsContentChanges`): sign-ins, failed sign-ins and the team's actions in the panel.
 *
 * It never keeps an email or a full IP: a failed sign-in keeps a keyed hash of the email (to see many attempts on
 * one account) and the truncated IP, as the consents do.
 */
final class AuditLog
{
    /** Sign-ins and failures. Deleted with the account (`Accounts::delete`). */
    public const AUTH = 'auth';

    /** What the team did in the panel. */
    public const ADMIN = 'admin';

    /**
     * @param  string  $channel  `web` (Google, session), `android` (Google, token) or `panel` (password)
     */
    public static function signedIn(User $user, string $channel): void
    {
        activity(self::AUTH)->causedBy($user)->event('login')
            ->withProperties(['channel' => $channel, 'ip_prefix' => Consents::ipPrefix(Request::ip())])
            ->log('login');
    }

    /**
     * @param  string  $reason  why, in a word: `invalid_token`, `closed_account`, `wrong_password`…
     */
    public static function signInFailed(string $channel, string $reason, ?string $email = null): void
    {
        activity(self::AUTH)->event('login_failed')
            ->withProperties([
                'channel' => $channel,
                'reason' => $reason,
                'email_hash' => $email === null || $email === '' ? null : self::emailHash($email),
                'ip_prefix' => Consents::ipPrefix(Request::ip()),
            ])
            ->log('login_failed');
    }

    /**
     * An action of the team in the panel: a CSV download, a message sent, a role given.
     *
     * @param  array<string, scalar|list<scalar>|null>  $details  never personal data
     */
    public static function admin(string $action, ?Model $subject = null, array $details = []): void
    {
        $log = activity(self::ADMIN)->event($action)->withProperties($details);
        if ($subject !== null) {
            $log->performedOn($subject);
        }
        $log->log($action);
    }

    /** Keyed with the APP_KEY, so the hash cannot be matched to an email by anyone without it. */
    public static function emailHash(string $email): string
    {
        return hash_hmac('sha256', 'audit|'.Str::lower(trim($email)), Config::string('app.key'));
    }

    /** The sign-ins of a person whose account is deleted go with it. */
    public static function forget(User $user): void
    {
        Activity::query()->where('log_name', self::AUTH)
            ->where('causer_type', $user->getMorphClass())->where('causer_id', $user->getKey())->delete();
    }
}
