<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Browser security headers for every response. The Content-Security-Policy
 * depends on who renders the page: the React app, the admin panel or the API.
 *
 * @see docs/seguranca.md
 */
class SecurityHeaders
{
    /**
     * @var array<string, string>
     */
    private const HEADERS = [
        'X-Content-Type-Options' => 'nosniff',
        'X-Frame-Options' => 'DENY',
        'Referrer-Policy' => 'strict-origin-when-cross-origin',
        'Permissions-Policy' => 'camera=(), microphone=(self), geolocation=(), payment=(), usb=(), interest-cohort=()',
        // Allows the Google sign-in popup to talk back to the page.
        'Cross-Origin-Opener-Policy' => 'same-origin-allow-popups',
    ];

    /**
     * React app: only our own files, no inline code. The service worker and the manifest are ours too (the PWA).
     */
    private const CSP_APP = "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; "
        ."font-src 'self'; connect-src 'self'; worker-src 'self'; manifest-src 'self'; object-src 'none'; "
        ."base-uri 'self'; form-action 'self'; frame-ancestors 'none'";

    /**
     * Admin panel: Livewire and Alpine need inline scripts and eval. Accepted
     * because only allowlisted staff can open it (see docs/seguranca.md).
     */
    private const CSP_ADMIN = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
        ."style-src 'self' 'unsafe-inline'; img-src 'self' data: https://ui-avatars.com; font-src 'self' data:; "
        ."connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'";

    /**
     * API: JSON only, nothing to load.
     */
    private const CSP_API = "default-src 'none'; frame-ancestors 'none'";

    /**
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        foreach (self::HEADERS as $name => $value) {
            $response->headers->set($name, $value);
        }

        $response->headers->set('Content-Security-Policy', $this->contentSecurityPolicy($request));

        if ($request->isSecure()) {
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        }

        // Staging (and any copy that is not production) must never show up in search results.
        if (! app()->isProduction()) {
            $response->headers->set('X-Robots-Tag', 'noindex, nofollow');
        }

        return $response;
    }

    private function contentSecurityPolicy(Request $request): string
    {
        return match (true) {
            $request->is('api/*') => self::CSP_API,
            $request->is('admin', 'admin/*', 'livewire*') => self::CSP_ADMIN,
            default => self::CSP_APP,
        };
    }
}
