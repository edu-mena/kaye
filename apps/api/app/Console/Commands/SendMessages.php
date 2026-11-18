<?php

namespace App\Console\Commands;

use App\Messaging\Sender;
use Illuminate\Console\Command;

/**
 * Puts the next batch of every message being sent on the queue (scheduled every minute).
 */
class SendMessages extends Command
{
    protected $signature = 'kaye:send-messages';

    protected $description = 'Queue the next batch of the messages being sent, within the hourly limits';

    public function handle(Sender $sender): int
    {
        $this->info("Queued {$sender->run()} deliveries.");

        return self::SUCCESS;
    }
}
