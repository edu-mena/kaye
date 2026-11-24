<?php

namespace App\Providers;

use App\Models\User;
use App\Support\Submission;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Writes without an account allowed per IP and per hour (docs/seguranca.md).
     *
     * @var array<string, int>
     */
    public const HOURLY_WRITES = [
        'waitlist' => 10,
        'feedback' => 10,
        'interviews' => 6,
        'public-cards' => 30,
    ];

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

        // Kursos without the daily limit, and the certificate: Plus, and never a minor (ADR 0025).
        Gate::define('kursos.unlimited', fn (User $user): bool => $user->hasPlus() && $user->isAdult());
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

        RateLimiter::for('login', fn (Request $request): Limit => Limit::perMinute(10)->by('login:'.$request->ip()));

        // The links in the emails: a person clicks a few; guessing signatures takes many.
        RateLimiter::for('notice-links', fn (Request $request): Limit => Limit::perMinute(20)->by('notice-links:'.$request->ip()));

        // Comments and reports: 20 an hour per account.
        RateLimiter::for('comments', function (Request $request): Limit {
            $who = $request->user()?->getAuthIdentifier() ?? $request->ip();

            return Limit::perHour(20)
                ->by('comments:'.(is_int($who) || is_string($who) ? $who : 'unknown'))
                ->response(fn (Request $request, array $headers): JsonResponse => Submission::json(['error' => 'too_many'], 429)->withHeaders($headers));
        });

        // The writes without an account, per IP and per hour, as on the Vercel functions. Creating and changing a
        // public card share one count. The answer is the one the app knows: {"error": "too_many"}.
        foreach (self::HOURLY_WRITES as $name => $perHour) {
            RateLimiter::for($name, fn (Request $request): Limit => Limit::perHour($perHour)
                ->by("{$name}:".$request->ip())
                ->response(fn (Request $request, array $headers): JsonResponse => Submission::json(['error' => 'too_many'], 429)->withHeaders($headers)));
        }
    }
}
