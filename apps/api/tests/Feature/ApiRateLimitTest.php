<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Route;
use Tests\TestCase;

/**
 * docs/seguranca.md: reads 300 per minute, writes 60, per account or IP, each counted apart.
 */
class ApiRateLimitTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        Route::middleware('api')->prefix('api/v1')->post('/test-write', fn (): array => ['ok' => true]);
    }

    public function test_guests_get_300_reads_per_minute_then_429(): void
    {
        for ($i = 1; $i <= 300; $i++) {
            $this->getJson('/api/v1/health')->assertOk();
        }

        $this->getJson('/api/v1/health')
            ->assertTooManyRequests()
            ->assertHeader('Retry-After');
    }

    public function test_guests_get_60_writes_per_minute_then_429_and_still_read(): void
    {
        for ($i = 1; $i <= 60; $i++) {
            $this->postJson('/api/v1/test-write')->assertOk();
        }

        $this->postJson('/api/v1/test-write')->assertTooManyRequests();
        $this->getJson('/api/v1/health')->assertOk();
    }

    public function test_the_limit_is_counted_per_ip(): void
    {
        for ($i = 1; $i <= 60; $i++) {
            $this->postJson('/api/v1/test-write', [], ['REMOTE_ADDR' => '10.0.0.1']);
        }

        $this->withServerVariables(['REMOTE_ADDR' => '10.0.0.2'])
            ->postJson('/api/v1/test-write')
            ->assertOk();
    }
}
