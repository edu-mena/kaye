<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\MeResource;
use App\Models\User;
use App\Support\Accounts;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;

/**
 * GET /me, GET /me/export and DELETE /me: the account, its export and its deletion (Lei n.º 22/11).
 */
class MeController extends Controller
{
    public function show(Request $request): MeResource
    {
        return new MeResource(self::user($request));
    }

    public function export(Request $request, Accounts $accounts): JsonResponse
    {
        return response()->json($accounts->export(self::user($request)), options: JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
            ->header('Content-Disposition', 'attachment; filename="kaye-os-meus-dados.json"')
            ->header('Cache-Control', 'no-store');
    }

    public function destroy(Request $request, Accounts $accounts): Response
    {
        $accounts->delete(self::user($request));

        if ($request->hasSession()) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        return response()->noContent();
    }

    public static function user(Request $request): User
    {
        $user = $request->user();
        abort_unless($user instanceof User, 401);

        return $user;
    }
}
