<?php

namespace Tests\Feature;

use App\Models\User;
use App\Support\CronHeartbeat;
use App\Support\SystemHealth;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

/**
 * docs/observabilidade.md: the detailed /health behind HEALTH_TOKEN, the alert of a stuck queue, and Pulse
 * inside the panel.
 */
class MonitoringTest extends TestCase
{
    use RefreshDatabase;

    private const TOKEN = 'health-token-0123456789';

    protected function setUp(): void
    {
        parent::setUp();
        // The free space of the machine running the tests is not the server's: the threshold is set here.
        config(['kaye.health_token' => self::TOKEN, 'kaye.admin_emails' => ['boss@kaye.test'], 'kaye.disk_min_free_percent' => 0]);
        CronHeartbeat::beat();
    }

    public function test_without_the_token_health_says_only_whether_it_works(): void
    {
        $this->getJson('/api/v1/health')->assertOk()
            ->assertJsonPath('status', 'ok')
            ->assertJsonPath('checks', ['database' => 'ok']);
        $this->getJson('/api/v1/health', ['X-Health-Token' => 'wrong-token-0123456789'])->assertOk()->assertJsonMissingPath('checks.queue');
    }

    public function test_a_short_health_token_shows_nothing_to_anyone(): void
    {
        config(['kaye.health_token' => 'short']);

        $this->getJson('/api/v1/health', ['X-Health-Token' => 'short'])->assertOk()->assertJsonMissingPath('checks.disk');
    }

    public function test_with_the_token_health_shows_every_check(): void
    {
        $this->getJson('/api/v1/health', ['X-Health-Token' => self::TOKEN])->assertOk()
            ->assertJsonPath('checks.database', 'ok')
            ->assertJsonPath('checks.queue.status', 'ok')
            ->assertJsonPath('checks.queue.pending', 0)
            ->assertJsonPath('checks.cron.status', 'ok')
            ->assertJsonStructure(['checks' => ['cron' => ['last_beat_seconds'], 'disk' => ['status', 'free_percent', 'free_mb']]]);
        // Monitors that cannot send a header use ?token=.
        $this->getJson('/api/v1/health?token='.self::TOKEN)->assertJsonPath('checks.queue.status', 'ok');
    }

    public function test_a_stuck_queue_or_a_full_disk_turns_health_into_503(): void
    {
        $this->queueJobWaiting(minutes: 20);
        $this->getJson('/api/v1/health', ['X-Health-Token' => self::TOKEN])->assertServiceUnavailable()
            ->assertJsonPath('status', 'degraded')
            ->assertJsonPath('checks.queue.status', 'stuck')
            ->assertJsonPath('checks.queue.pending', 1);

        DB::table('jobs')->delete();
        config(['kaye.disk_min_free_percent' => 101]);
        $this->getJson('/api/v1/health', ['X-Health-Token' => self::TOKEN])->assertServiceUnavailable()->assertJsonPath('checks.disk.status', 'low');
    }

    public function test_a_young_job_is_not_a_stuck_queue(): void
    {
        $this->queueJobWaiting(minutes: 2);

        $this->assertSame('ok', SystemHealth::queue()['status']);
    }

    public function test_a_stuck_queue_emails_the_admins_once_an_hour_without_the_queue(): void
    {
        Mail::fake();
        $this->queueJobWaiting(minutes: 30);

        $this->assertSame(1, Artisan::call('kaye:check-queue'));
        $this->assertSame(1, Artisan::call('kaye:check-queue'));

        Mail::assertSentCount(1);
        Mail::assertNothingQueued();
    }

    public function test_a_healthy_queue_sends_no_alert(): void
    {
        Mail::fake();

        $this->assertSame(0, Artisan::call('kaye:check-queue'));
        Mail::assertNothingSent();
    }

    public function test_pulse_opens_only_for_admins_of_the_panel(): void
    {
        config(['pulse.enabled' => true, 'kaye.admin_emails' => ['boss@kaye.test', 'ed@kaye.test', 'out@kaye.test']]);

        $this->get('/admin/pulse')->assertForbidden();
        $this->actingAs(User::factory()->editor()->create(['email' => 'ed@kaye.test']))->get('/admin/pulse')->assertForbidden();
        $this->actingAs(User::factory()->admin()->withoutTotp()->create(['email' => 'out@kaye.test']))->get('/admin/pulse')->assertForbidden();
        $this->actingAs(User::factory()->admin()->create(['email' => 'boss@kaye.test']))->get('/admin/pulse')->assertOk()
            ->assertHeader('Content-Security-Policy');
    }

    private function queueJobWaiting(int $minutes): void
    {
        $at = now()->subMinutes($minutes)->getTimestamp();
        DB::table('jobs')->insert(['queue' => 'default', 'payload' => '{}', 'attempts' => 0, 'reserved_at' => null, 'available_at' => $at, 'created_at' => $at]);
    }
}
