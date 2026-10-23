<?php

use Illuminate\Support\Facades\Schedule;

// Times are Angola time (app.schedule_timezone). Cron runs `php artisan schedule:run` every minute.

Schedule::command('sanctum:prune-expired --hours=24')->dailyAt('02:00');
