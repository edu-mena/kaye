<?php

namespace App\Http\Controllers\Api;

use App\Enums\ConsentKind;
use App\Http\Controllers\Controller;
use App\Models\Consent;
use App\Support\Consents;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

/**
 * GET/POST /me/consents and DELETE /me/consents/{kind}: what the person agreed to, with the version
 * of the text, the date, where (`app`) and the truncated IP. A minor, or anyone whose age is unknown,
 * cannot give a marketing consent. Withdrawing the last push consent removes the browsers' subscriptions.
 */
class ConsentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        return response()->json(
            MeController::user($request)->consents()->active()->oldest('id')->get()->map(self::shape(...))->all(),
        );
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'kind' => ['required', Rule::enum(ConsentKind::class)],
            'version' => ['required', 'string', 'max:16'],
        ]);
        $user = MeController::user($request);
        $kind = $request->enum('kind', ConsentKind::class);
        abort_if($kind === null, 422);

        if ($kind->isMarketing() && ! $user->canReceiveMarketing()) {
            throw ValidationException::withMessages(['kind' => 'Minors cannot receive marketing.']);
        }

        $consent = Consents::grant($user, $kind, $request->string('version')->value(), 'app', $request->ip());

        return response()->json(self::shape($consent), $consent->wasRecentlyCreated ? 201 : 200);
    }

    public function destroy(Request $request, ConsentKind $kind): Response
    {
        Consents::revoke(MeController::user($request), $kind);

        return response()->noContent();
    }

    /**
     * @return array{kind: string, version: string, grantedAt: string}
     */
    private static function shape(Consent $consent): array
    {
        return [
            'kind' => $consent->kind->value,
            'version' => $consent->version,
            'grantedAt' => $consent->granted_at->toIso8601String(),
        ];
    }
}
