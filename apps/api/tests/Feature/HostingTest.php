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

    public function test_the_files_apache_serves_by_itself_are_never_type_sniffed(): void
    {
        // Before, the JavaScript, the styles and the images left without X-Content-Type-Options (ZAP rule 10021).
        $this->assertMatchesRegularExpression('/<IfModule mod_headers\.c>.*Header set X-Content-Type-Options "nosniff".*<\/IfModule>/s', $this->file('public/.htaccess'));
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

    public function test_both_htaccess_files_send_www_to_the_bare_domain_before_anything_else(): void
    {
        foreach (['.htaccess', 'public/.htaccess'] as $path) {
            $rules = $this->file($path);

            $www = strpos($rules, 'RewriteCond %{HTTP_HOST} ^www\.(.+)$ [NC]');
            $this->assertNotFalse($www, "$path does not redirect www.");
            $this->assertStringContainsString('RewriteRule ^ https://%1%{REQUEST_URI} [L,R=301]', $rules);
            // Before the https rule, so the visitor goes to https://domain in one step.
            $this->assertLessThan(strpos($rules, 'RewriteCond %{HTTPS} off'), $www, "$path: www must come before the https rule.");
        }
    }

    public function test_the_root_htaccess_hides_the_php_version_on_hosts_that_ignore_php_ini(): void
    {
        $rules = $this->file('.htaccess');

        $this->assertMatchesRegularExpression('/<IfModule mod_headers\.c>\s*Header always unset X-Powered-By\s*<\/IfModule>/', $rules);
    }

    public function test_post_deploy_waits_for_the_hostinger_composer_and_then_drops_the_dev_tools(): void
    {
        $script = $this->file('../../scripts/post-deploy.sh');

        $wait = strpos($script, "pgrep -u \"\$(id -u)\" -f '[c]omposer (install|update)'");
        $restore = strpos($script, 'git checkout -q -- vendor bootstrap/cache');
        $migrate = strpos($script, 'artisan migrate --force');

        $this->assertNotFalse($wait, 'The wait for the Git deploy composer is missing.');
        $this->assertNotFalse($restore, 'vendor/ is not put back from the deploy branch.');
        $this->assertNotFalse($migrate);
        $this->assertTrue($wait < $restore && $restore < $migrate, 'Wait, then restore vendor/, then migrate.');
        // Hostinger's composer sometimes starts late: 30 s without it before touching vendor/.
        $this->assertStringContainsString('[ "$idle" -ge 6 ] && break', $script);
        // The dev tools it brings back are removed, and a vendor/ that still differs stops the deploy.
        $this->assertStringContainsString('git clean -fdq -- vendor', $script);
        $this->assertStringContainsString('[ -z "$(git status --porcelain -- vendor)" ] || {', $script);
        // The old release's caches go before the first artisan call: a new config key read at boot would be
        // missing and artisan could not even clear them (rehearsal on staging, 27/11/2026).
        $clear = strpos($script, 'rm -f bootstrap/cache/config.php');
        $this->assertNotFalse($clear, 'The old config cache is not removed.');
        $this->assertTrue($restore < $clear && $clear < $migrate, 'Restore vendor/, drop the old caches, then migrate.');
        // No second composer run: it raced Hostinger's and left vendor/ half written (27/11/2026).
        $this->assertStringNotContainsString('install --no-dev', $script);
        // The images approved in the panel are served from public/storage.
        $this->assertStringContainsString('[ -e public/storage ] || "$php" artisan storage:link', $script);
        // The cron is checked on the server, before the smoke test: the public /health no longer shows it.
        $health = strpos($script, 'artisan kaye:health');
        $this->assertNotFalse($health, 'The deploy does not check the cron.');
        $this->assertLessThan(strpos($script, 'scripts/smoke-test.sh'), $health);
    }

    public function test_the_deploy_retries_only_the_transient_ssh_failure(): void
    {
        $script = $this->file('../../scripts/finish-deploy.sh');

        $this->assertStringContainsString('-o ConnectTimeout=10', $script);
        $this->assertStringContainsString('PHP=/opt/alt/php84/usr/bin/php scripts/post-deploy.sh', $script);
        $this->assertStringContainsString('[ "$rc" != 255 ] && break', $script);
        $this->assertStringContainsString('for attempt in 1 2 3', $script);
        $this->assertStringContainsString('exit "$rc"', $script);
        // Production waits for staging: an environment without its secrets stops the line instead of skipping.
        $this->assertMatchesRegularExpression('/\[ -z "\$missing" \] \|\| \{[^}]*exit 1; \}/', $script);
    }

    public function test_production_only_gets_the_release_after_staging_passed(): void
    {
        $workflow = $this->file('../../.github/workflows/deploy.yml');

        $this->assertStringContainsString('git push origin HEAD:deploy-staging', $workflow);
        $this->assertMatchesRegularExpression('/  staging:.*needs: publish.*environment: staging.*scripts\/finish-deploy\.sh/s', $workflow);
        $this->assertMatchesRegularExpression('/  promote:.*needs: \[publish, staging\].*ref: \$\{\{ needs\.publish\.outputs\.tree \}\}.*git push origin HEAD:deploy\n/s', $workflow);
        $this->assertMatchesRegularExpression('/  production:.*needs: promote.*environment: production.*scripts\/finish-deploy\.sh/s', $workflow);
        // The deploy branch is pushed only by the promote job.
        $this->assertSame(1, substr_count($workflow, 'HEAD:deploy'."\n"));
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
        config(['kaye.health_token' => str_repeat('h', 20)]);

        $this->getJson('/api/v1/health', ['X-Health-Token' => str_repeat('h', 20)])->assertServiceUnavailable()->assertJsonPath('checks.cron.status', 'unknown');
    }

    public function test_health_says_the_cron_is_ok_after_a_beat_and_stale_when_it_stops(): void
    {
        CronHeartbeat::beat();
        config(['kaye.health_token' => str_repeat('h', 20)]);
        $this->getJson('/api/v1/health', ['X-Health-Token' => str_repeat('h', 20)])->assertJsonPath('checks.cron.status', 'ok');

        $this->travel(CronHeartbeat::STALE_AFTER_SECONDS + 1)->seconds();
        $this->getJson('/api/v1/health', ['X-Health-Token' => str_repeat('h', 20)])->assertServiceUnavailable()->assertJsonPath('checks.cron.status', 'stale');
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
