<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Picks the response language from the Accept-Language header (pt, en or fr).
 */
class SetLocaleFromRequest
{
    public function handle(Request $request, Closure $next): Response
    {
        $locales = config('kaye.locales');

        app()->setLocale($request->getPreferredLanguage($locales) ?? $locales[0]);

        $response = $next($request);
        $response->headers->set('Content-Language', app()->getLocale());

        return $response;
    }
}
