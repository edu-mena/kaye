<?php

namespace Tests\Feature;

use App\Support\CronHeartbeat;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

/**
 * What the Hostinger deploy depends on (docs/infraestrutura.md): the .htaccess files, the proxy that hides
 * https from the app and the cron's pulse.
 */
class HostingTest extends TestCase
{
    private function file(string $path): string
    {
        $contents = file_get_contents(base_path($path));
        $this->assertIsString($contents);

        return $contents;
    }

    public function test_the_public_htaccess_keeps_the_worker_and_the_manifest_out_of_every_cache(): void
    {
        $rules = $this->file('public/.htaccess');

        $this->assertMatchesRegularExpression('/<Files "sw\.js">.*Service-Worker-Allowed "\/".*Cache-Control "no-cache".*<\/Files>/s', $rules);
        $this->assertMatchesRegularExpression('/<Files "manifest\.webmanifest">\s*Header set Cache-Control "no-cache"/', $rules);
        $this->assertStringContainsString('max-age=31536000, immutable', $rules);
    }

    public function test_the_public_htaccess_forces_https_except_on_this_machine(): void
    {
        $rules = $this->file('public/.htaccess');

        $this->assertStringContainsString('RewriteCond %{HTTPS} off', $rules);
        $this->assertStringContainsString('https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]', $rules);
        $this->assertStringContainsString('localhost|127', $rules);
    }

    public function test_the_root_htaccess_serves_only_the_public_folder(): void
    {
        $rules = $this->file('.htaccess');

        $this->assertStringContainsString('RewriteCond %{REQUEST_URI} !^/public/', $rules);
        $this->assertStringContainsString('RewriteRule ^(.*)$ /public/$1 [L]', $rules);
        $this->assertStringContainsString('Options -Indexes', $rules);
        $this->assertStringContainsString('RewriteCond %{HTTPS} off', $rules);
    }

    public function test_the_app_knows_a_request_was_https_when_the_proxy_says_so(): void
    {
        $this->get('/api/v1/health', ['X-Forwarded-Proto' => 'https'])
            ->assertHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }

    public function test_the_forwarded_host_is_not_trusted(): void
    {
        $this->get('/api/v1/health', ['X-Forwarded-Host' => 'evil.example']);

        $this->assertStringNotContainsString('evil.example', request()->getHost());
    }

    public function test_health_says_the_cron_is_unknown_until_it_beats(): void
    {
        Cache::forget('kaye.cron.heartbeat');

        $this->getJson('/api/v1/health')->assertOk()->assertJsonPath('checks.cron', 'unknown');
    }

    public function test_health_says_the_cron_is_ok_after_a_beat_and_stale_when_it_stops(): void
    {
        CronHeartbeat::beat();
        $this->getJson('/api/v1/health')->assertJsonPath('checks.cron', 'ok');

        $this->travel(CronHeartbeat::STALE_AFTER_SECONDS + 1)->seconds();
        $this->getJson('/api/v1/health')->assertOk()->assertJsonPath('checks.cron', 'stale');
    }

    public function test_the_scheduler_beats_every_minute(): void
    {
        $event = collect(app(Schedule::class)->events())
            ->first(fn ($event): bool => $event->description === 'cron-heartbeat');

        $this->assertNotNull($event, 'The heartbeat is not scheduled.');
        $this->assertSame('* * * * *', $event->expression);

        Cache::forget('kaye.cron.heartbeat');
        $event->run(app());

        $this->assertNotNull(CronHeartbeat::lastBeat());
    }
}
