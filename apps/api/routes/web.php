<?php

use App\Http\Controllers\Auth\GoogleLoginController;
use App\Http\Controllers\NoticeLinkController;
use App\Http\Controllers\SitemapController;
use App\Http\Controllers\SpaController;
use Illuminate\Support\Facades\Route;

// Web login with Google (ADR 0003): outside /api/v1, because it creates the session cookie.
Route::middleware('throttle:login')->group(function (): void {
    Route::get('/auth/google/redirect', [GoogleLoginController::class, 'redirect']);
    Route::get('/auth/google/callback', [GoogleLoginController::class, 'callback']);
});

// The signed links in the emails, without signing in (docs/seguranca.md, "Avisos"). POST /unsubscribe is the
// mail app's one-click button: it has no CSRF token (bootstrap/app.php); the signature is its proof.
Route::middleware('throttle:notice-links')->group(function (): void {
    Route::get('/waitlist/confirm/{token}', [NoticeLinkController::class, 'confirm'])->name('waitlist.confirm');
    Route::match(['get', 'post'], '/unsubscribe/{token}', [NoticeLinkController::class, 'unsubscribe'])->name('unsubscribe');
});

// Every public page, for search engines (docs/seo.md). robots.txt (public/) points here.
Route::get('/sitemap.xml', SitemapController::class);

// /admin is registered by Filament. Every other page belongs to the React app.
Route::get('/', SpaController::class);
Route::fallback(SpaController::class);
