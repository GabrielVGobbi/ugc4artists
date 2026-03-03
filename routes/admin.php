<?php

use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Admin\CampaignController;
use App\Http\Controllers\Admin\DevController;
use App\Http\Controllers\Admin\PaymentController;
use App\Http\Controllers\Admin\UsersController;
use App\Http\Controllers\Admin\WaitlistController;
use App\Http\Controllers\Api\AccountApiController;
use App\Http\Controllers\Api\AuthenticateApiController;
use App\Http\Controllers\App\DashboardAppController;
use App\Http\Controllers\HomeController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\URL;
use Inertia\Inertia;
use Laravel\Fortify\Features;

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
*/

Route::name('admin.')->prefix('admin')->middleware(['auth', 'role:admin'])->group(function () {

    Route::resource('users', UsersController::class);

    Route::get('/payments', [PaymentController::class, 'index'])->name('payments.index');
    Route::get('/payments/{payment}', [PaymentController::class, 'show'])->name('payments.show');

    Route::get('/teste-email', [AdminController::class, 'testeEmail'])->name('teste.email');
    Route::get('/campaigns', [CampaignController::class, 'index'])->name('campaigns.index');
    Route::get('/campaigns/{campaign}', [CampaignController::class, 'show'])->name('campaigns.show');
    Route::get('/waitlist', [WaitlistController::class, 'index'])->name('waitlist.index');
    Route::get('/waitlist/{id}', [WaitlistController::class, 'show'])->name('waitlist.show');
    Route::get('/', [AdminController::class, 'index'])->name('admin.dashboard');
    Route::get('/components/{componentName?}', [DevController::class, 'index'])->name('dev.component');
});
