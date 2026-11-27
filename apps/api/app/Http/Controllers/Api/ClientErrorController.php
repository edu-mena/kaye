<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\ClientErrors;
use App\Support\Submission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

use function Sentry\captureEvent;

/**
 * POST /client-errors: an error the web app could not handle, sent on to Sentry (ClientErrors). Without a Sentry
 * DSN nothing is sent. Answers 202 either way: the app never waits on it or retries.
 */
class ClientErrorController extends Controller
{
    private const MAX_BODY = 6_000;

    public function store(Request $request): JsonResponse
    {
        $body = Submission::read($request, self::MAX_BODY);
        if ($body === null) {
            return Submission::invalid();
        }
        $message = $body['message'] ?? null;
        $stack = $body['stack'] ?? null;
        $path = $body['path'] ?? null;
        $source = $body['source'] ?? null;
        if (! Submission::text($message, ClientErrors::MAX_MESSAGE)
            || ! Submission::optionalText($stack, ClientErrors::MAX_STACK)
            || ! is_string($path) || mb_strlen($path) > 300
            || ! in_array($source, ClientErrors::SOURCES, true)) {
            return Submission::invalid();
        }

        captureEvent(ClientErrors::event($message, is_string($stack) ? $stack : null, $path, $source));

        return Submission::json(['ok' => true], 202);
    }
}
