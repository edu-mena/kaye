<?php

use App\Http\Middleware\AssignRequestId;
use App\Http\Middleware\SecurityHeaders;
use App\Http\Middleware\SetLocaleFromRequest;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Sentry\Laravel\Integration;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        apiPrefix: 'api/v1',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Every response, including /admin and /up.
        $middleware->prepend(AssignRequestId::class);
        $middleware->append(SecurityHeaders::class);

        // The one-click unsubscribe of the mail apps (RFC 8058) cannot carry a CSRF token; its URL is signed.
        $middleware->validateCsrfTokens(except: ['unsubscribe/*']);

        $middleware->throttleApi();
        $middleware->api(append: [
            SetLocaleFromRequest::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Sends errors to Sentry when SENTRY_LARAVEL_DSN is set; does nothing otherwise.
        Integration::handles($exceptions);

        $exceptions->shouldRenderJsonWhen(
            fn (Request $request): bool => $request->is('api/*') || $request->expectsJson(),
        );
    })->create();
