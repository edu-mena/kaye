<?php

namespace Tests\Feature;

use Tests\TestCase;

class ApiRateLimitTest extends TestCase
{
    public function test_guests_get_60_requests_per_minute_then_429(): void
    {
        for ($i = 1; $i <= 60; $i++) {
            $this->getJson('/api/v1/health')->assertOk();
        }

        $this->getJson('/api/v1/health')
            ->assertTooManyRequests()
            ->assertHeader('Retry-After');
    }

    public function test_the_limit_is_counted_per_ip(): void
    {
        for ($i = 1; $i <= 60; $i++) {
            $this->getJson('/api/v1/health', ['REMOTE_ADDR' => '10.0.0.1']);
        }

        $this->withServerVariables(['REMOTE_ADDR' => '10.0.0.2'])
            ->getJson('/api/v1/health')
            ->assertOk();
    }
}
