<?php

use App\Http\Controllers\SpaController;
use Illuminate\Support\Facades\Route;

// /admin is registered by Filament. Every other page belongs to the React app.
Route::get('/', SpaController::class);
Route::fallback(SpaController::class);
