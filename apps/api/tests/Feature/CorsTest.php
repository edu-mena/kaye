<?php

namespace Tests\Feature;

use Illuminate\Testing\TestResponse;
use Symfony\Component\HttpFoundation\Response;
use Tests\TestCase;

class CorsTest extends TestCase
{
    public function test_the_android_app_origin_is_allowed(): void
    {
        $this->preflight('https://localhost')
            ->assertNoContent()
            ->assertHeader('Access-Control-Allow-Origin', 'https://localhost');
    }

    public function test_the_ios_app_origin_is_allowed(): void
    {
        $this->preflight('capacitor://localhost')
            ->assertHeader('Access-Control-Allow-Origin', 'capacitor://localhost');
    }

    public function test_other_websites_are_not_allowed(): void
    {
        $this->preflight('https://evil.example')
            ->assertHeaderMissing('Access-Control-Allow-Origin');
    }

    public function test_cookies_are_never_shared_cross_origin(): void
    {
        $this->preflight('https://localhost')
            ->assertHeaderMissing('Access-Control-Allow-Credentials');
    }

    /**
     * @return TestResponse<Response>
     */
    private function preflight(string $origin): TestResponse
    {
        return $this->call('OPTIONS', '/api/v1/health', server: [
            'HTTP_ORIGIN' => $origin,
            'HTTP_ACCESS_CONTROL_REQUEST_METHOD' => 'GET',
        ]);
    }
}
