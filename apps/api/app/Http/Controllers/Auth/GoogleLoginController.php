<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Support\Accounts;
use App\Support\AuditLog;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as GoogleUser;
use Symfony\Component\HttpFoundation\RedirectResponse as SymfonyRedirect;
use Throwable;

/**
 * Web login (ADR 0003): Google's OAuth with Socialite, then a Laravel session in an HttpOnly cookie.
 * Socialite's `state` ties the callback to the browser that started it (CSRF on the login itself).
 */
class GoogleLoginController extends Controller
{
    private const NEXT = 'login.next';

    public function redirect(Request $request): SymfonyRedirect
    {
        $request->session()->put(self::NEXT, self::safePath($request->query('next')));

        return Socialite::driver('google')->redirect();
    }

    public function callback(Request $request, Accounts $accounts): RedirectResponse
    {
        try {
            $google = Socialite::driver('google')->user();
        } catch (Throwable) {
            AuditLog::signInFailed('web', 'invalid_callback');

            return redirect('/?login=failed');
        }

        if (! $google instanceof GoogleUser || ($google->user['email_verified'] ?? false) !== true || ! is_string($google->getEmail())) {
            AuditLog::signInFailed('web', 'unverified_email');

            return redirect('/?login=failed');
        }

        try {
            $user = $accounts->fromGoogle([
                'sub' => (string) $google->getId(),
                'email' => $google->getEmail(),
                'name' => $google->getName() ?? $google->getEmail(),
                'picture' => $google->getAvatar(),
            ]);
        } catch (AuthorizationException) {
            AuditLog::signInFailed('web', 'closed_account', $google->getEmail());

            return redirect('/?login=closed');
        }

        $next = self::safePath($request->session()->pull(self::NEXT));
        Auth::guard('web')->login($user);
        // A new session id after login: one planted before it is worth nothing (session fixation).
        $request->session()->regenerate();

        return redirect($next);
    }

    /** Only a path of this site: never `//evil.example` nor `https://…` (open redirect). */
    private static function safePath(mixed $path): string
    {
        return is_string($path) && preg_match('#^/(?![/\\\\])#', $path) === 1 ? $path : '/';
    }
}
