<?php

declare(strict_types=1);

use App\Http\Controllers\Auth\AuthController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Authentication Routes
|--------------------------------------------------------------------------
|
| Routes for Google OAuth authentication flow.
|
*/
Route::middleware('guest')->group(function () {
    Route::get('/auth', [AuthController::class, 'authenticate'])->name('google.auth');
    Route::get('/auth/redirect', [AuthController::class, 'redirect'])->name('google.redirect');
    Route::get('/auth/callback', [AuthController::class, 'handleGoogleCallback'])->name('google.callback');
});
