<?php

namespace App\Support;

use App\Enums\ConsentKind;
use App\Enums\MessageChannel;
use App\Enums\MessagePurpose;
use App\Models\Consent;
use App\Models\Contracts\ReceivesNotices;
use App\Models\User;
use App\Models\WaitlistEntry;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;

/**
 * The consents behind every notice (docs/seguranca.md, "Avisos"): giving one keeps the proof (version, date,
 * where, truncated IP); nothing is sent without the one its channel and purpose need, and news never reaches a
 * minor or anyone whose age is unknown. The waiting list's email needs the double opt-in.
 */
final class Consents
{
    /**
     * Records a consent unless the same one is active already. Returns the active consent.
     */
    public static function grant(ReceivesNotices $who, ConsentKind $kind, string $version, string $source, ?string $ip, bool $confirmed = false): Consent
    {
        $existing = self::of($who)->active()->where('kind', $kind)->where('version', $version)->first();
        if ($existing instanceof Consent) {
            return $existing;
        }

        return self::of($who)->create([
            'kind' => $kind,
            'version' => $version,
            'source' => $source,
            'ip_prefix' => self::ipPrefix($ip),
            'granted_at' => now(),
            'confirmed_at' => $confirmed ? now() : null,
        ]);
    }

    /**
     * The proof of what someone agreed to on the waiting list form: the email's notices (waiting for the
     * double opt-in) and the messages sent by hand to the WhatsApp number. Dated when they agreed.
     */
    public static function forWaitlist(WaitlistEntry $entry, ?string $ip): void
    {
        $kinds = array_filter([
            $entry->email !== null ? ConsentKind::EmailService : null,
            $entry->whatsapp !== null ? ConsentKind::WhatsappMarketing : null,
        ]);
        foreach ($kinds as $kind) {
            $entry->consents()->create([
                'kind' => $kind,
                'version' => self::version(),
                'source' => $entry->source,
                'ip_prefix' => self::ipPrefix($ip),
                'granted_at' => $entry->consent_at,
            ]);
        }
    }

    /**
     * Withdraws a consent. Without the last push consent the browsers' subscriptions go too: nothing would be
     * allowed through them.
     */
    public static function revoke(ReceivesNotices $who, ConsentKind $kind): void
    {
        DB::transaction(function () use ($who, $kind): void {
            self::of($who)->active()->where('kind', $kind)->update(['revoked_at' => now()]);

            if ($who instanceof User && $kind->isPush() && ! self::has($who, ConsentKind::PushService) && ! self::has($who, ConsentKind::PushMarketing)) {
                $who->pushSubscriptions()->delete();
            }
            if ($who instanceof WaitlistEntry && ! self::of($who)->active()->exists()) {
                $who->forceFill(['unsubscribed_at' => now()])->save();
            }
        });
    }

    /**
     * Whether this person has this consent in force: active, and confirmed when it is the waiting list's email.
     */
    public static function has(ReceivesNotices $who, ConsentKind $kind): bool
    {
        return self::of($who)->where(fn (Builder $query) => self::inForce($query, $kind, $who instanceof WaitlistEntry))->exists();
    }

    /**
     * Whether a message on this channel and with this purpose may reach this person now.
     */
    public static function allows(ReceivesNotices $who, MessageChannel $channel, MessagePurpose $purpose): bool
    {
        if ($purpose === MessagePurpose::Marketing && ! $who->canReceiveMarketing()) {
            return false;
        }
        if ($channel === MessageChannel::Push && ! $who instanceof User) {
            return false;
        }

        return self::has($who, ConsentKind::for($channel, $purpose));
    }

    /**
     * The conditions of a consent in force, for a query on `consents`.
     *
     * @param  Builder<Consent>  $query
     */
    public static function inForce(Builder $query, ConsentKind $kind, bool $waitlist): void
    {
        $query->where('kind', $kind)->whereNull('revoked_at');
        if ($waitlist && $kind->isEmail()) {
            $query->whereNotNull('confirmed_at');
        }
    }

    /**
     * The IP without its last part: enough to see where many signups came from, not to find a person.
     * IPv4 keeps 3 bytes (1.2.3.0); IPv6 keeps 48 bits (2001:db8:1::).
     */
    public static function ipPrefix(?string $ip): ?string
    {
        $packed = $ip === null ? false : @inet_pton($ip);
        if ($packed === false) {
            return null;
        }
        $keep = strlen($packed) === 4 ? 3 : 6;
        $masked = inet_ntop(substr($packed, 0, $keep).str_repeat("\0", strlen($packed) - $keep));

        return $masked === false ? null : $masked;
    }

    /** The version of the texts in force, recorded with every consent given outside the app. */
    public static function version(): string
    {
        return Config::string('kaye.legal_version');
    }

    /**
     * @return HasMany<Consent, User>|HasMany<Consent, WaitlistEntry>
     */
    private static function of(ReceivesNotices $who): HasMany
    {
        return $who instanceof User ? $who->consents() : self::entry($who)->consents();
    }

    private static function entry(ReceivesNotices $who): WaitlistEntry
    {
        assert($who instanceof WaitlistEntry);

        return $who;
    }
}
