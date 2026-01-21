<?php

use App\Http\Controllers\Api\AccountApiController;
use App\Http\Controllers\Api\AuthenticateApiController;
use App\Http\Controllers\App\DashboardAppController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\URL;
use Inertia\Inertia;
use Laravel\Fortify\Features;

/*
|--------------------------------------------------------------------------
| Api Routes
|--------------------------------------------------------------------------
*/

Route::post('auth', [AuthenticateApiController::class, 'auth'])->name('api.auth');

Route::name('api.')->prefix('v1/')->middleware('auth:sanctum')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | onboarding
    |--------------------------------------------------------------------------
    */
    Route::prefix('onboarding')->name('onboarding.')->group(function () {
        Route::post('/complete', [DashboardAppController::class, 'completeOnboarding'])->name('complete');
    });

    /*
    |--------------------------------------------------------------------------
    | Minha Conta
    |--------------------------------------------------------------------------
    */
    Route::get('account', [AccountApiController::class, 'me'])->name('account');
});
