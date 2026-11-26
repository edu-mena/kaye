<?php

namespace App\Http\Middleware;

use App\Enums\StaffPermission;
use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;
use Symfony\Component\HttpFoundation\Response;

/**
 * /mcp only with a Sanctum token made for it in the panel (docs/ia.md): the ability `mcp` written explicitly. The
 * app's own tokens have `*`, which Sanctum's `tokenCan` would accept for anything, so `*` is refused here; a
 * session cookie is not a token and is refused too. The owner must still be able to write content and pass the
 * panel's two locks (staff role and ADMIN_EMAILS).
 */
class EnsureMcpToken
{
    public const ABILITY = 'mcp';

    /**
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if (! $user instanceof User) {
            return response()->json(['error' => 'unauthenticated'], 401);
        }

        // The token of this request's Bearer header, not Sanctum's "current" one: a session cookie has none.
        $token = PersonalAccessToken::findToken((string) $request->bearerToken());
        $abilities = $token !== null && $token->tokenable_id === $user->getKey() && $token->tokenable_type === $user->getMorphClass() ? $token->abilities : [];
        if ($abilities !== [self::ABILITY]) {
            return response()->json(['error' => 'This token is not an MCP token. Create one in the panel: Caixa da IA > Tokens MCP.'], 403);
        }
        if (! $user->can(StaffPermission::ContentEdit->value) || ! in_array(strtolower($user->email), config()->array('kaye.admin_emails'), true)) {
            return response()->json(['error' => 'This account cannot write content.'], 403);
        }

        return $next($request);
    }
}
