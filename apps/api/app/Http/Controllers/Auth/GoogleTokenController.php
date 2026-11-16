<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Resources\MeResource;
use App\Support\Accounts;
use App\Support\GoogleIdTokenVerifier;
use App\Support\InvalidGoogleToken;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;

/**
 * POST /auth/google (Android, ADR 0003): Google's ID token in, a Sanctum token valid for 30 days out.
 */
class GoogleTokenController extends Controller
{
    public function __invoke(Request $request, GoogleIdTokenVerifier $verifier, Accounts $accounts): JsonResponse
    {
        $request->validate([
            'id_token' => ['required', 'string', 'max:4096'],
            'device_name' => ['nullable', 'string', 'max:80'],
        ]);

        try {
            $user = $accounts->fromGoogle($verifier->verify($request->string('id_token')->value()));
        } catch (InvalidGoogleToken) {
            return response()->json(['message' => 'Invalid Google token.'], 401);
        } catch (AuthorizationException) {
            return response()->json(['message' => 'This account was closed.'], 403);
        }

        $token = $user->createToken(
            $request->filled('device_name') ? $request->string('device_name')->value() : 'android',
            ['*'],
            now()->addMinutes(Config::integer('sanctum.expiration')),
        );

        return response()->json([
            'token' => $token->plainTextToken,
            'expiresAt' => $token->accessToken->expires_at?->toIso8601String(),
            'user' => new MeResource($user),
        ]);
    }
}
