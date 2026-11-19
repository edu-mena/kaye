<?php

namespace Tests\Feature;

use Illuminate\Console\Scheduling\Event;
use Illuminate\Console\Scheduling\Schedule;
use Tests\TestCase;

class ScheduleTest extends TestCase
{
    public function test_expired_api_tokens_are_pruned_daily_at_2am_angola_time(): void
    {
        $event = collect(app(Schedule::class)->events())
            ->first(fn (Event $event): bool => str_contains((string) $event->command, 'sanctum:prune-expired'));

        $this->assertNotNull($event, 'sanctum:prune-expired is not scheduled');
        $this->assertSame('0 2 * * *', $event->expression);
        $this->assertSame('Africa/Luanda', $event->timezone);
    }

    public function test_the_queue_and_the_messages_run_every_minute_and_the_reminders_daily(): void
    {
        $events = collect(app(Schedule::class)->events());
        $find = fn (string $command): ?Event => $events->first(fn (Event $event): bool => str_contains((string) $event->command, $command));

        $queue = $find('queue:work');
        $this->assertNotNull($queue, 'the queue is not processed');
        $this->assertSame('* * * * *', $queue->expression);
        $this->assertStringContainsString('--stop-when-empty', (string) $queue->command);
        $this->assertStringContainsString('--max-time=50', (string) $queue->command);
        $this->assertTrue($queue->withoutOverlapping);

        $this->assertSame('* * * * *', $find('kaye:send-messages')?->expression);
        $this->assertSame('0 8 * * *', $find('kaye:deadline-reminders')?->expression);
    }

    public function test_interviews_are_pruned_daily_at_2am_angola_time(): void
    {
        $event = collect(app(Schedule::class)->events())
            ->first(fn (Event $event): bool => str_contains((string) $event->command, 'model:prune')
                && str_contains((string) $event->command, 'Interview'));

        $this->assertNotNull($event, 'model:prune for interviews is not scheduled');
        $this->assertSame('0 2 * * *', $event->expression);
        $this->assertSame('Africa/Luanda', $event->timezone);
    }
}
