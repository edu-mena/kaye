<?php

use App\Models\Interview;
use Illuminate\Support\Facades\Schedule;

// Times are Angola time (app.schedule_timezone). Cron runs `php artisan schedule:run` every minute.

Schedule::command('sanctum:prune-expired --hours=24')->dailyAt('02:00');

// Interviews sent for review are kept 12 months, with the answers and the contact (docs/base-de-dados.md).
Schedule::command('model:prune', ['--model' => [Interview::class]])->dailyAt('02:00');

// The queue (emails, push) on shared hosting: no worker stays on, so each minute one runs until the queue is
// empty or 50 seconds pass, before the next minute's (docs/infraestrutura.md).
Schedule::command('queue:work --stop-when-empty --max-time=50')->everyMinute()->withoutOverlapping();

// Messages go out in batches within each channel's hourly limit; the saved deadlines get their reminder.
Schedule::command('kaye:send-messages')->everyMinute()->withoutOverlapping();
Schedule::command('kaye:deadline-reminders')->dailyAt('08:00');
