<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Laravel\Boost\BoostServiceProvider;

/**
 * Refuses an insecure production configuration. Runs in the deploy pipeline
 * after the new release is in place; a failure stops the deploy.
 */
class CheckProductionConfig extends Command
{
    protected $signature = 'kaye:check-production';

    protected $description = 'Check that the production configuration is safe';

    public function handle(): int
    {
        $results = collect($this->checks());

        $this->table(
            ['', 'Check'],
            $results->map(fn (bool $passed, string $check): array => [$passed ? 'OK' : 'FAIL', $check])->values(),
        );

        $failures = $results->reject(fn (bool $passed): bool => $passed);

        if ($failures->isNotEmpty()) {
            $this->error("{$failures->count()} check(s) failed. Fix the .env before going live.");

            return self::FAILURE;
        }

        $this->info('Production configuration is safe.');

        return self::SUCCESS;
    }

    /**
     * @return array<string, bool>
     */
    private function checks(): array
    {
        $url = config('app.url');
        $key = config('app.key');
        $stack = config('logging.channels.stack.channels');
        $dsn = config('sentry.dsn');

        return [
            'APP_ENV is production (staging only on a staging. address)' => app()->isProduction()
                || (app()->environment('staging') && is_string($url) && str_starts_with($url, 'https://staging.')),
            'APP_DEBUG is false' => config('app.debug') === false,
            'APP_KEY is set' => is_string($key) && $key !== '',
            'APP_URL uses https' => is_string($url) && str_starts_with($url, 'https://'),
            'SESSION_SECURE_COOKIE is true' => config('session.secure') === true,
            'Session cookie is HTTP-only' => config('session.http_only') === true,
            'ADMIN_EMAILS is not empty' => config('kaye.admin_emails') !== [],
            'API tokens expire' => is_int(config('sanctum.expiration')) && config('sanctum.expiration') > 0,
            'Logs are JSON (LOG_STACK=json)' => is_array($stack) && in_array('json', $stack, true),
            'LOG_LEVEL is not debug' => config('logging.channels.json.level') !== 'debug',
            'Error tracking is on (SENTRY_LARAVEL_DSN)' => is_string($dsn) && str_starts_with($dsn, 'https://'),
            // Dev tools inject scripts and expose endpoints: install with `composer install --no-dev`.
            'Dev tools are off (laravel/boost)' => ! class_exists(BoostServiceProvider::class)
                || config('boost.enabled') === false,
        ];
    }
}
