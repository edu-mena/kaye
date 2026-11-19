<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

/**
 * Gives every request an ID, adds it to every log line and returns it in the
 * X-Request-Id header, so a user's error report can be traced in the logs.
 */
class AssignRequestId
{
    public const HEADER = 'X-Request-Id';

    /**
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $id = $this->incomingId($request) ?? (string) Str::uuid();

        $request->headers->set(self::HEADER, $id);
        Log::shareContext(['request_id' => $id]);

        $response = $next($request);
        $response->headers->set(self::HEADER, $id);

        return $response;
    }

    /**
     * Reuses the caller's ID (app, proxy) only if it is a safe token, so it
     * cannot inject text into the logs.
     */
    private function incomingId(Request $request): ?string
    {
        $id = $request->headers->get(self::HEADER);

        return $id !== null && preg_match('/^[A-Za-z0-9._-]{8,64}$/', $id) === 1 ? $id : null;
    }
}
