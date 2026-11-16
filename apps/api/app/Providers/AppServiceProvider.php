<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureRateLimiting();
    }

    /**
     * Request limits from docs/seguranca.md. Signed-in users are counted by
     * account, guests by IP address. Reads have a higher limit than writes:
     * each page of the app makes several, they come from the cache, and many
     * phones share one IP address behind the operator (CGNAT).
     */
    private function configureRateLimiting(): void
    {
        RateLimiter::for('api', function (Request $request): Limit {
            $reads = $request->isMethodSafe();
            $who = $request->user()?->getAuthIdentifier() ?? $request->ip();

            return Limit::perMinute($reads ? 300 : 60)
                ->by(($reads ? 'read:' : 'write:').(is_int($who) || is_string($who) ? $who : 'unknown'));
        });
    }
}
