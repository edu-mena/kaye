<?php

use App\Models\Interview;
use Illuminate\Support\Facades\Schedule;

// Times are Angola time (app.schedule_timezone). Cron runs `php artisan schedule:run` every minute.

Schedule::command('sanctum:prune-expired --hours=24')->dailyAt('02:00');

// Interviews sent for review are kept 12 months, with the answers and the contact (docs/base-de-dados.md).
Schedule::command('model:prune', ['--model' => [Interview::class]])->dailyAt('02:00');
