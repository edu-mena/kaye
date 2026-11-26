<?php

namespace Tests\Feature;

use Illuminate\Testing\PendingCommand;
use Tests\TestCase;

class CheckProductionConfigTest extends TestCase
{
    public function test_a_safe_production_configuration_passes(): void
    {
        $this->useSafeProductionConfig();

        $this->check()
            ->expectsOutputToContain('Production configuration is safe.')
            ->assertSuccessful();
    }

    public function test_debug_mode_in_production_fails(): void
    {
        $this->useSafeProductionConfig();
        config(['app.debug' => true]);

        $this->check()
            ->expectsOutputToContain('1 check(s) failed')
            ->assertFailed();
    }

    public function test_the_testing_environment_is_not_production_ready(): void
    {
        $this->check()->assertFailed();
    }

    public function test_staging_passes_on_its_own_address(): void
    {
        $this->useSafeProductionConfig();
        $this->app->instance('env', 'staging');
        config(['app.url' => 'https://staging.kaye.ao']);

        $this->check()->assertSuccessful();
    }

    public function test_staging_on_the_production_address_fails(): void
    {
        $this->useSafeProductionConfig();
        $this->app->instance('env', 'staging');

        $this->check()->assertFailed();
    }

    public function test_an_empty_admin_allowlist_fails(): void
    {
        $this->useSafeProductionConfig();
        config(['kaye.admin_emails' => []]);

        $this->check()->assertFailed();
    }

    public function test_production_without_error_tracking_fails(): void
    {
        $this->useSafeProductionConfig();
        config(['sentry.dsn' => null]);

        $this->check()->assertFailed();
    }

    public function test_active_dev_tools_fail(): void
    {
        $this->useSafeProductionConfig();
        config(['boost.enabled' => true]);

        $this->check()->assertFailed();
    }

    public function test_plain_http_fails(): void
    {
        $this->useSafeProductionConfig();
        config(['app.url' => 'http://kaye.ao']);

        $this->check()->assertFailed();
    }

    private function check(): PendingCommand
    {
        $command = $this->artisan('kaye:check-production');
        $this->assertInstanceOf(PendingCommand::class, $command);

        return $command;
    }

    private function useSafeProductionConfig(): void
    {
        $this->app->instance('env', 'production');

        config([
            'app.debug' => false,
            'app.url' => 'https://kaye.ao',
            'session.secure' => true,
            'session.http_only' => true,
            'kaye.admin_emails' => ['admin@kaye.ao'],
            'sanctum.expiration' => 43200,
            'logging.channels.stack.channels' => ['json'],
            'logging.channels.json.level' => 'info',
            'sentry.dsn' => 'https://public@o0.ingest.sentry.io/0',
            // Boost is installed here (dev); in production it is not installed at all.
            'boost.enabled' => false,
        ]);
    }
}
