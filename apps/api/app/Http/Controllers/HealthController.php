<?php

namespace App\Http\Controllers;

use App\Enums\Locale;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Throwable;

/**
 * Health check for uptime monitors and the app: 200 when everything works,
 * 503 when a dependency is down. Never exposes error details.
 */
class HealthController
{
    public function __invoke(): JsonResponse
    {
        $databaseIsUp = $this->databaseIsUp();

        return response()->json([
            'status' => $databaseIsUp ? 'ok' : 'degraded',
            'app' => config('app.name'),
            'locale' => app()->getLocale(),
            'locales' => Locale::values(),
            'checks' => [
                'database' => $databaseIsUp ? 'ok' : 'down',
            ],
        ], $databaseIsUp ? 200 : 503, ['Cache-Control' => 'no-store']);
    }

    private function databaseIsUp(): bool
    {
        try {
            DB::select('select 1');

            return true;
        } catch (Throwable $exception) {
            // Logged and sent to error tracking; the response stays generic.
            report($exception);

            return false;
        }
    }
}
