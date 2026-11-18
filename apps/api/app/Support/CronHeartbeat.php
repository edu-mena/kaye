<?php

namespace App\Support;

use Illuminate\Support\Facades\Cache;

/**
 * The cron's pulse. On shared hosting the only thing running by itself is the cron line of the hPanel
 * (`* * * * * php artisan schedule:run`); every minute the scheduler writes the time here, and the health check
 * reads it. A cron that stopped is otherwise silent: no email, push or news, and no error anywhere.
 */
class CronHeartbeat
{
    private const KEY = 'kaye.cron.heartbeat';

    /** More than this without a beat and the cron is considered stopped (it should beat every minute). */
    public const STALE_AFTER_SECONDS = 300;

    public static function beat(): void
    {
        Cache::forever(self::KEY, now()->getTimestamp());
    }

    public static function lastBeat(): ?int
    {
        $beat = Cache::get(self::KEY);

        return is_int($beat) ? $beat : null;
    }

    /**
     * `ok`: beat in the last minutes. `stale`: it beat once and stopped. `unknown`: never beat (new install, or a
     * cron that was never set up).
     */
    public static function status(): string
    {
        $beat = self::lastBeat();

        return match (true) {
            $beat === null => 'unknown',
            now()->getTimestamp() - $beat > self::STALE_AFTER_SECONDS => 'stale',
            default => 'ok',
        };
    }
}
