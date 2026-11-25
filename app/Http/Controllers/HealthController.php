<?php

namespace App\Http\Controllers;

use App\Enums\Locale;
use App\Support\AccessToken;
use App\Support\SystemHealth;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;

/**
 * GET /api/v1/health. For everyone (the app's "service status"): whether the Kayé works, 200 or 503, without
 * details. With HEALTH_TOKEN (the uptime monitor): every check (database, queue, cron, disk), and 503 when any of
 * them is wrong. Never an error message.
 */
class HealthController
{
    public function __invoke(Request $request): JsonResponse
    {
        $databaseIsUp = SystemHealth::databaseIsUp();
        $answer = [
            'status' => $databaseIsUp ? 'ok' : 'degraded',
            'app' => config('app.name'),
            'locale' => app()->getLocale(),
            'locales' => Locale::values(),
            'checks' => ['database' => $databaseIsUp ? 'ok' : 'down'],
        ];

        if ($databaseIsUp && AccessToken::allows($request, Config::string('kaye.health_token'))) {
            $answer['checks'] += [
                'queue' => SystemHealth::queue(),
                'cron' => SystemHealth::cron(),
                'disk' => SystemHealth::disk(),
            ];
            $healthy = $answer['checks']['queue']['status'] === 'ok'
                && $answer['checks']['cron']['status'] === 'ok'
                && $answer['checks']['disk']['status'] !== 'low';
            $answer['status'] = $healthy ? 'ok' : 'degraded';
        }

        return response()->json($answer, $answer['status'] === 'ok' ? 200 : 503, ['Cache-Control' => 'no-store']);
    }
}
