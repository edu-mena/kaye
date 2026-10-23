<?php

namespace Tests\Feature;

use Tests\TestCase;

class HealthTest extends TestCase
{
    public function test_health_endpoint_answers_under_v1(): void
    {
        $this->getJson('/api/v1/health')
            ->assertOk()
            ->assertJson([
                'status' => 'ok',
                'locales' => ['pt', 'en', 'fr'],
            ]);
    }

    public function test_language_follows_accept_language_header(): void
    {
        $this->getJson('/api/v1/health', ['Accept-Language' => 'fr-FR,fr;q=0.9'])
            ->assertJsonPath('locale', 'fr')
            ->assertHeader('Content-Language', 'fr');
    }

    public function test_unsupported_language_falls_back_to_portuguese(): void
    {
        $this->getJson('/api/v1/health', ['Accept-Language' => 'de-DE'])
            ->assertJsonPath('locale', 'pt');
    }

    public function test_unknown_api_route_returns_json_404(): void
    {
        $this->getJson('/api/v1/does-not-exist')
            ->assertNotFound()
            ->assertJsonStructure(['message']);
    }
}
