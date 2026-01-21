<?php

use App\Http\Controllers\Admin\UsersController;
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

/*
|--------------------------------------------------------------------------
| Routes Usuários
|--------------------------------------------------------------------------
*/
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

/*
|--------------------------------------------------------------------------
| Routes Admin
|--------------------------------------------------------------------------
*/
Route::name('api.')->prefix('v1/')->middleware(['auth:sanctum', 'role:developer'])->group(function () {
    Route::name('admin.')->prefix('admin')->group(function () {
        Route::apiResource('users', UsersController::class);
    });
});
