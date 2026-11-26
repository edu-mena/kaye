<?php

namespace App\Support;

use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Throwable;

/**
 * The checks of GET /api/v1/health and of the queue alert (docs/observabilidade.md). Each one says `ok` or what is
 * wrong, with numbers and never an error message (it could carry a path, a host or a query).
 */
final class SystemHealth
{
    public static function databaseIsUp(): bool
    {
        try {
            DB::select('select 1');

            return true;
        } catch (Throwable $exception) {
            report($exception);

            return false;
        }
    }

    /**
     * The database queue: jobs waiting, the age of the oldest one that could already run, and the failed ones.
     * `stuck` when that one waits longer than QUEUE_STUCK_MINUTES: the cron's worker is not emptying it.
     *
     * @return array{status: string, pending: int, oldest_seconds: int|null, failed: int}
     */
    public static function queue(): array
    {
        $now = now()->getTimestamp();
        $oldest = DB::table('jobs')->whereNull('reserved_at')->where('available_at', '<=', $now)->min('available_at');
        $age = is_numeric($oldest) ? $now - (int) $oldest : null;

        return [
            'status' => $age !== null && $age > Config::integer('kaye.queue_stuck_minutes') * 60 ? 'stuck' : 'ok',
            'pending' => DB::table('jobs')->count(),
            'oldest_seconds' => $age,
            'failed' => DB::table('failed_jobs')->count(),
        ];
    }

    /**
     * @return array{status: string, last_beat_seconds: int|null}
     */
    public static function cron(): array
    {
        $beat = CronHeartbeat::lastBeat();

        return [
            'status' => CronHeartbeat::status(),
            'last_beat_seconds' => $beat === null ? null : now()->getTimestamp() - $beat,
        ];
    }

    /**
     * The disk where the app writes (logs, cache files, backups before they leave).
     *
     * @return array{status: string, free_percent: float|null, free_mb: int|null}
     */
    public static function disk(?string $path = null): array
    {
        $path ??= storage_path();
        $free = @disk_free_space($path);
        $total = @disk_total_space($path);
        if ($free === false || $total === false || $total <= 0) {
            return ['status' => 'unknown', 'free_percent' => null, 'free_mb' => null];
        }
        $percent = round($free / $total * 100, 1);

        return [
            'status' => $percent < Config::integer('kaye.disk_min_free_percent') ? 'low' : 'ok',
            'free_percent' => $percent,
            'free_mb' => (int) floor($free / 1_048_576),
        ];
    }
}
