<?php

namespace App\Console\Commands;

use App\Messaging\DeadlineReminders as Reminders;
use Illuminate\Console\Command;

/**
 * Starts the reminders of the saved deadlines closing in a few days (scheduled daily).
 */
class DeadlineReminders extends Command
{
    protected $signature = 'kaye:deadline-reminders';

    protected $description = 'Remind people of the deadlines they saved, a few days before they close';

    public function handle(Reminders $reminders): int
    {
        $this->info("Reminders for {$reminders->run()} deadlines.");

        return self::SUCCESS;
    }
}
