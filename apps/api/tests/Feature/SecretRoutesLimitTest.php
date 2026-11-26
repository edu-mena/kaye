<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * The routes opened by a secret (export, ingest, switching off a public card) had only the general API limit:
 * 300 guesses a minute per IP. Now 30 (docs/seguranca.md, "Força bruta e abuso").
 */
class SecretRoutesLimitTest extends TestCase
{
    use RefreshDatabase;

    public function test_guessing_the_export_token_stops_after_30_tries_a_minute(): void
    {
        config(['kaye.waitlist_export_token' => str_repeat('s', 20)]);

        for ($try = 1; $try <= 30; $try++) {
            $this->getJson('/api/v1/waitlist/export?token=guess-'.$try)->assertUnauthorized();
        }

        $this->getJson('/api/v1/waitlist/export?token=guess-31')->assertTooManyRequests();
        $this->postJson('/api/v1/ingest/jobs', [], ['X-Ingest-Token' => 'guess'])->assertTooManyRequests();
        $this->deleteJson('/api/v1/public-cards/AAAAAAAAAAAA', [], ['Authorization' => 'Bearer guess'])->assertTooManyRequests();
    }

    public function test_another_ip_is_not_blocked(): void
    {
        for ($try = 1; $try <= 31; $try++) {
            $this->getJson('/api/v1/waitlist/export');
        }

        $this->withServerVariables(['REMOTE_ADDR' => '10.0.0.9'])->getJson('/api/v1/waitlist/export')->assertUnauthorized();
    }
}
