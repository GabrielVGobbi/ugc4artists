<?php

use App\Http\Controllers\App\DashboardAppController;
use App\Http\Controllers\App\WalletAppController as WalletApp;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth'])->prefix('app')->name('app.')->group(function () {


    /*
    |--------------------------------------------------------------------------
    | Wallet
    |--------------------------------------------------------------------------
    */
    Route::prefix('wallet')->name('wallet.')->group(function () {
        Route::get('/', [WalletApp::class, 'index'])->name('index');
        Route::get('/add-balance', [WalletApp::class, 'create'])->name('create');
        Route::post('/deposit', [WalletApp::class, 'addBalanceCheckout'])->name('deposit');
    });


    // Rotas de Onboarding
    Route::prefix('onboarding')->name('onboarding.')->group(function () {
        Route::get('/', [DashboardAppController::class, 'onboarding'])->name('index');
        Route::post('/progress', [DashboardAppController::class, 'saveOnboardingProgress'])->name('progress');
        Route::post('/complete', [DashboardAppController::class, 'completeOnboarding'])->name('complete');
    });

    Route::middleware(['onboarding'])->group(function () {
        Route::get('/dashboard', [DashboardAppController::class, 'index'])->name('dashboard');
        Route::get('/campaigns', fn() => Inertia::render('app/campaigns'))->name('campaigns');
        Route::get('/artists', fn() => Inertia::render('app/artists'))->name('artists');
        Route::get('/brands', fn() => Inertia::render('app/brands'))->name('brands');
        Route::get('/proposals', fn() => Inertia::render('app/proposals'))->name('proposals');
        Route::get('/analytics', fn() => Inertia::render('app/analytics'))->name('analytics');
        Route::get('/inbox', fn() => Inertia::render('app/inbox'))->name('inbox');
        Route::get('/payments', fn() => Inertia::render('app/payments'))->name('payments');
        Route::get('/studio', fn() => Inertia::render('app/studio'))->name('studio');
        Route::get('/settings', fn() => Inertia::render('app/settings'))->name('settings');
    });
});
