<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class HealthTest extends TestCase
{
    public function test_health_endpoint_reports_ok_when_the_database_answers(): void
    {
        $this->getJson('/api/v1/health')
            ->assertOk()
            ->assertHeader('Cache-Control', 'no-store, private')
            ->assertJson([
                'status' => 'ok',
                'locales' => ['pt', 'en', 'fr'],
                'checks' => ['database' => 'ok'],
            ]);
    }

    public function test_health_endpoint_returns_503_without_details_when_the_database_is_down(): void
    {
        config(['database.connections.mysql.database' => 'kaye_does_not_exist']);
        DB::purge('mysql');

        $this->getJson('/api/v1/health')
            ->assertServiceUnavailable()
            ->assertJson(['status' => 'degraded', 'checks' => ['database' => 'down']])
            ->assertDontSee('SQLSTATE')
            ->assertDontSee('kaye_does_not_exist');
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
