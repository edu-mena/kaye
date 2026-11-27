<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\File;
use Illuminate\Testing\TestResponse;
use PHPUnit\Framework\Attributes\DataProvider;
use Symfony\Component\HttpFoundation\Response;
use Tests\TestCase;

class SecurityHeadersTest extends TestCase
{
    /**
     * @return array<string, array{string}>
     */
    public static function everyKindOfPage(): array
    {
        return [
            'api' => ['/api/v1/health'],
            'admin' => ['/admin/login'],
            'framework health' => ['/up'],
        ];
    }

    #[DataProvider('everyKindOfPage')]
    public function test_every_response_has_the_basic_security_headers(string $path): void
    {
        $this->assertBasicHeaders($this->get($path));
    }

    public function test_the_react_app_gets_a_strict_policy_without_inline_code(): void
    {
        $index = public_path('spa/index.html');
        $original = is_file($index) ? File::get($index) : null;
        File::ensureDirectoryExists(dirname($index));
        File::put($index, '<!doctype html><div id="root"></div>');

        try {
            $csp = $this->get('/')->assertOk()->headers->get('Content-Security-Policy');
        } finally {
            $original === null ? File::delete($index) : File::put($index, $original);
        }

        $this->assertIsString($csp);
        $this->assertStringContainsString("script-src 'self';", $csp);
        // The PWA: the service worker and the manifest are our own files, and nothing else may register a worker.
        $this->assertStringContainsString("worker-src 'self';", $csp);
        $this->assertStringContainsString("manifest-src 'self';", $csp);
        $this->assertStringContainsString("frame-ancestors 'none'", $csp);
        $this->assertStringNotContainsString('unsafe-inline', $csp);
        $this->assertStringNotContainsString('unsafe-eval', $csp);
    }

    public function test_the_api_gets_a_policy_that_loads_nothing(): void
    {
        $this->get('/api/v1/health')
            ->assertHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");
    }

    public function test_the_admin_policy_still_blocks_framing_and_plugins(): void
    {
        $csp = $this->get('/admin/login')->headers->get('Content-Security-Policy');

        $this->assertIsString($csp);
        $this->assertStringContainsString("frame-ancestors 'none'", $csp);
        $this->assertStringContainsString("object-src 'none'", $csp);
    }

    public function test_hsts_is_sent_only_over_https(): void
    {
        $this->get('/api/v1/health')->assertHeaderMissing('Strict-Transport-Security');

        $this->get('https://localhost/api/v1/health')
            ->assertHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }

    public function test_staging_asks_search_engines_not_to_index_it(): void
    {
        $this->app->instance('env', 'staging');

        $this->get('/up')->assertHeader('X-Robots-Tag', 'noindex, nofollow');
        $this->get('/api/v1/health')->assertHeader('X-Robots-Tag', 'noindex, nofollow');
    }

    public function test_production_can_be_indexed(): void
    {
        $this->app->instance('env', 'production');

        $this->get('/up')->assertHeaderMissing('X-Robots-Tag');
        // The API's JSON never ranks, even in production: the pages do (docs/seo.md).
        $this->get('/api/v1/health')->assertHeader('X-Robots-Tag', 'noindex, nofollow');
    }

    /**
     * @param  TestResponse<Response>  $response
     */
    private function assertBasicHeaders(TestResponse $response): void
    {
        $response
            ->assertHeader('X-Content-Type-Options', 'nosniff')
            ->assertHeader('X-Frame-Options', 'DENY')
            ->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
            ->assertHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups')
            ->assertHeader('Content-Security-Policy');

        $this->assertStringContainsString('camera=()', (string) $response->headers->get('Permissions-Policy'));
    }
}
