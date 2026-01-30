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
| Admin Routes
|--------------------------------------------------------------------------
*/

Route::name('admin.')->prefix('admin')->middleware(['auth', 'role:developer'])->group(function () {
    Route::resource('users', UsersController::class);


});
