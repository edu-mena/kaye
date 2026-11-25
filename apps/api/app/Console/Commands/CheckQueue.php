<?php

namespace App\Console\Commands;

use App\Mail\QueueStuckAlert;
use App\Support\SystemHealth;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Mail;

/**
 * The alert of a stuck queue (scheduled every 5 minutes). On shared hosting a stuck queue is silent: emails and
 * push stop with no error anywhere. The email goes straight out, never through the queue that is stuck, and at
 * most once an hour.
 */
class CheckQueue extends Command
{
    protected $signature = 'kaye:check-queue';

    protected $description = 'Email ADMIN_EMAILS when a queued job waits for too long';

    private const ALERTED = 'kaye.queue.alerted';

    public function handle(): int
    {
        $queue = SystemHealth::queue();
        if ($queue['status'] === 'ok') {
            $this->info("Queue ok: {$queue['pending']} waiting.");

            return self::SUCCESS;
        }

        $recipients = Config::array('kaye.admin_emails');
        if ($recipients === [] || ! Cache::add(self::ALERTED, true, now()->addHour())) {
            $this->warn('Queue stuck; alert already sent this hour (or no ADMIN_EMAILS).');

            return self::FAILURE;
        }

        $minutes = intdiv((int) $queue['oldest_seconds'], 60);
        Mail::to($recipients)->send(new QueueStuckAlert($queue['pending'], $minutes, $queue['failed']));
        $this->error("Queue stuck for {$minutes} minutes: alert sent.");

        return self::FAILURE;
    }
}
