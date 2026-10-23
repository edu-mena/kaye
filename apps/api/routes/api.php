<?php

use App\Http\Controllers\HealthController;
use Illuminate\Support\Facades\Route;

// Everything here is served under /api/v1 (see bootstrap/app.php).

Route::get('/health', HealthController::class);
