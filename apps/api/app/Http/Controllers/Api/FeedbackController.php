<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Feedback;
use App\Support\Submission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * POST /feedback: a critique, an idea or a bug, read by the Kayé team in the admin panel or the CSV export.
 */
class FeedbackController extends Controller
{
    private const MAX_BODY = 8_000;

    public function store(Request $request): JsonResponse
    {
        $body = Submission::read($request, self::MAX_BODY);
        if ($body === null) {
            return Submission::invalid();
        }
        if (Submission::isBot($body)) {
            return Submission::json(['ok' => true], 201);
        }
        $kind = $body['kind'] ?? null;
        $message = $body['message'] ?? null;
        $page = $body['page'] ?? null;
        if (! is_string($kind) || ! in_array($kind, Feedback::KINDS, true)) {
            return Submission::invalid();
        }
        if (! is_string($message) || mb_strlen(trim($message)) < 3 || mb_strlen($message) > 2000) {
            return Submission::invalid();
        }

        Feedback::query()->create([
            'kind' => $kind,
            'message' => trim($message),
            'page' => is_string($page) && in_array($page, Feedback::PAGES, true) ? $page : 'landing',
            'locale' => Submission::locale($body['lang'] ?? null),
        ]);

        return Submission::json(['ok' => true], 201);
    }
}
