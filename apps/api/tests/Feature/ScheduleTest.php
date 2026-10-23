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
}
