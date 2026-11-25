<?php

namespace Tests\Feature;

use App\Support\CronHeartbeat;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/**
 * `kaye:health`: the deploy's check of the cron (and the queue and the disk) from the server, without the token.
 */
class HealthCommandTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // The free space of the machine running the tests is not the server's.
        config(['kaye.disk_min_free_percent' => 0]);
    }

    public function test_it_passes_when_the_cron_beats(): void
    {
        CronHeartbeat::beat();

        $this->assertSame(0, Artisan::call('kaye:health'));
        $this->assertStringContainsString('ok', Artisan::output());
    }

    public function test_it_fails_without_a_beat_or_with_a_stuck_queue(): void
    {
        Cache::forget('kaye.cron.heartbeat');
        $this->assertSame(1, Artisan::call('kaye:health'));
        $this->assertStringContainsString('cron', Artisan::output());

        CronHeartbeat::beat();
        $at = now()->subHour()->getTimestamp();
        DB::table('jobs')->insert(['queue' => 'default', 'payload' => '{}', 'attempts' => 0, 'reserved_at' => null, 'available_at' => $at, 'created_at' => $at]);
        $this->assertSame(1, Artisan::call('kaye:health'));
        $this->assertStringContainsString('queue', Artisan::output());
    }
}
