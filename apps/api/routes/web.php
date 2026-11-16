<?php

use App\Http\Controllers\Auth\GoogleLoginController;
use App\Http\Controllers\SpaController;
use Illuminate\Support\Facades\Route;

// Web login with Google (ADR 0003): outside /api/v1, because it creates the session cookie.
Route::middleware('throttle:login')->group(function (): void {
    Route::get('/auth/google/redirect', [GoogleLoginController::class, 'redirect']);
    Route::get('/auth/google/callback', [GoogleLoginController::class, 'callback']);
});

// /admin is registered by Filament. Every other page belongs to the React app.
Route::get('/', SpaController::class);
Route::fallback(SpaController::class);
