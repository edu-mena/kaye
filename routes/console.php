<?php

use App\Models\Interview;
use App\Support\CronHeartbeat;
use App\Support\PublicContent;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schedule;

// Times are Angola time (app.schedule_timezone). Cron runs `php artisan schedule:run` every minute.

// The beat of the cron: /api/v1/health says whether it is running (a dead cron stops the emails, the push and the news
// without any error).
Schedule::call(fn () => CronHeartbeat::beat())->name('cron-heartbeat')->everyMinute();

Schedule::command('sanctum:prune-expired --hours=24')->dailyAt('02:00');

// The public API's kept answers (files on disk): the old versions are never read again, so they go once a day.
Schedule::call(fn () => PublicContent::prune())->name('public-content-prune')->dailyAt('04:45');

// The database cache keeps a row per rate-limit counter and per lock, and never deletes the expired ones itself.
Schedule::call(fn () => DB::table('cache')->where('expiration', '<', now()->getTimestamp())->delete())
    ->name('cache-expired-rows')->dailyAt('04:50');

// Interviews sent for review are kept 12 months, with the answers and the contact (docs/base-de-dados.md).
Schedule::command('model:prune', ['--model' => [Interview::class]])->dailyAt('02:00');

// The queue (emails, push) on shared hosting: no worker stays on, so each minute one runs until the queue is
// empty or 50 seconds pass, before the next minute's (docs/infraestrutura.md).
Schedule::command('queue:work --stop-when-empty --max-time=50')->everyMinute()->withoutOverlapping();

// Messages go out in batches within each channel's hourly limit; the saved deadlines get their reminder.
Schedule::command('kaye:send-messages')->everyMinute()->withoutOverlapping();
Schedule::command('kaye:deadline-reminders')->dailyAt('08:00');

// Angola's news about training, work and careers, every 2 hours (docs/fontes-de-noticias.md). One bounded request
// per source; a source that fails is skipped.
Schedule::command('kaye:fetch-news')->everyTwoHours()->withoutOverlapping();

// A stuck queue sends an email (docs/observabilidade.md); a dead cron is seen by the uptime monitor (/health).
Schedule::command('kaye:check-queue')->everyFiveMinutes();

// The daily copy off Hostinger, kept 30 days, and the proof that it restores (docs/infraestrutura.md).
Schedule::command('kaye:backup')->dailyAt('03:00')->withoutOverlapping();
Schedule::command('backup:clean')->dailyAt('03:30');
Schedule::command('backup:monitor')->dailyAt('04:00');
Schedule::command('kaye:backup-restore-test')->weeklyOn(0, '04:30')
    ->when(fn (): bool => filled(config('database.connections.restore.database')));

// The audit log keeps a year (config/activitylog.php).
Schedule::command('activitylog:clean')->dailyAt('02:30');
