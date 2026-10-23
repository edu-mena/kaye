<?php

use Illuminate\Support\Facades\Route;

// Everything here is served under /api/v1 (see bootstrap/app.php).

Route::get('/health', fn () => [
    'status' => 'ok',
    'app' => config('app.name'),
    'locale' => app()->getLocale(),
    'locales' => config('kaye.locales'),
]);
