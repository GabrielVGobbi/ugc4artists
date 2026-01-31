<?php

use App\Http\Controllers\App\AccountController;
use App\Http\Controllers\App\AddressController;
use App\Http\Controllers\App\DashboardAppController;
use App\Http\Controllers\App\WalletAppController as WalletApp;
use App\Modules\Payments\Http\Controllers\PaymentController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth'])->prefix('app')->name('app.')->group(function () {
    /*
    |--------------------------------------------------------------------------
    | Onboarding
    |--------------------------------------------------------------------------
    */
    Route::prefix('onboarding')->name('onboarding.')->group(function () {
        Route::get('/', [DashboardAppController::class, 'onboarding'])->name('index');
        Route::post('/progress', [DashboardAppController::class, 'saveOnboardingProgress'])->name('progress');
        Route::post('/complete', [DashboardAppController::class, 'completeOnboarding'])->name('complete');
    });

    Route::middleware(['onboarding'])->group(function () {
        Route::get('/dashboard', [DashboardAppController::class, 'index'])->name('dashboard');
        Route::get('/campaigns', fn() => Inertia::render('app/campaigns'))->name('campaigns');
        Route::get('/artists', fn() => Inertia::render('app/artists'))->name('artists');

        /*
        |--------------------------------------------------------------------------
        | Notificações
        |--------------------------------------------------------------------------
        */
        Route::get('/notifications', fn() => Inertia::render('app/notifications/index'))->name('notifications.index');


        /*
        |--------------------------------------------------------------------------
        | Minha Conta
        |--------------------------------------------------------------------------
        */
        Route::prefix('account')->name('account.')->group(function () {
            Route::get('/', [AccountController::class, 'me']);

            /*
            |--------------------------------------------------------------------------
            | Endereços
            |--------------------------------------------------------------------------
            */
            Route::resource('addresses', AddressController::class);
        });

        /*
        |--------------------------------------------------------------------------
        | Wallet
        |--------------------------------------------------------------------------
        */
        Route::prefix('wallet')->name('wallet.')->group(function () {
            Route::get('/', [WalletApp::class, 'index'])->name('index');
            Route::get('/add-balance', [WalletApp::class, 'create'])->name('create');
            Route::post('/deposit', [WalletApp::class, 'addBalanceCheckout'])->name('deposit');
            Route::get('/payments', [WalletApp::class, 'payments'])->name('payments');
            Route::get('/payments/export', [WalletApp::class, 'exportPayments'])->name('payments.export');
        });

        /*
        |--------------------------------------------------------------------------
        | Payments
        |--------------------------------------------------------------------------
        */
        Route::prefix('payments')->name('payments.')->group(function () {
            Route::get('/', [PaymentController::class, 'payments'])->name('payments');
            Route::get('/{uuid}', [PaymentController::class, 'show'])->name('show');
            Route::get('/{uuid}/status', [PaymentController::class, 'status'])->name('status');
        });

        /*
        |--------------------------------------------------------------------------
        | Studio (Futuro)
        |--------------------------------------------------------------------------
        */
        Route::get('studio', [DashboardAppController::class, 'studio'])->name('studio');
    });
});
