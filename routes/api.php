<?php

use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Admin\UsersController;
use App\Http\Controllers\App\WalletAppController as WalletApp;
use App\Http\Controllers\Api\AccountApiController;
use App\Http\Controllers\Api\AuthenticateApiController;
use App\Http\Controllers\App\AddressController;
use App\Http\Controllers\App\DashboardAppController;
use App\Modules\Payments\Http\Controllers\CheckoutController;
use App\Modules\Payments\Http\Controllers\WebhookController;
use Illuminate\Support\Facades\Route;

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
    Route::prefix('account')->name('account.')->group(function () {
        Route::get('/', [AccountApiController::class, 'me'])->name('account');

        /*
        |--------------------------------------------------------------------------
        | Endereços
        |--------------------------------------------------------------------------
        */
        Route::apiResource('addresses', AddressController::class);
    });

    /*
    |--------------------------------------------------------------------------
    | Wallet
    |--------------------------------------------------------------------------
    */
    Route::prefix('wallet')->name('wallet.')->group(function () {
        Route::post('/add-balance', [WalletApp::class, 'addBalanceCheckout'])->name('add-balance');
        Route::get('/payment/{uuid}/status', [WalletApp::class, 'checkStatus'])->name('payment.status');
        Route::get('/payment/{uuid}', [WalletApp::class, 'showPayment'])->name('payment.show');
    });

    /*
    |--------------------------------------------------------------------------
    | Payments
    |--------------------------------------------------------------------------
    */
    Route::prefix('payments')->name('payments.')->group(function () {
        Route::post('/', [CheckoutController::class, 'store'])->name('store');
    });
});

/*
|--------------------------------------------------------------------------
| Routes Admin
|--------------------------------------------------------------------------
*/
Route::name('api.')->prefix('v1/')->middleware(['auth:sanctum', 'role:developer'])->group(function () {
    Route::name('admin.')->prefix('admin')->group(function () {
        Route::apiResource('users', UsersController::class);

        Route::get('/teste-checkout', [AdminController::class, 'testeCheckout'])->name('teste.checkout');
        Route::post('/teste-pagar', [AdminController::class, 'testePagarTransaction'])->name('teste.pagar');
    });
});

/*
|--------------------------------------------------------------------------
| Payment Webhooks (public)
|--------------------------------------------------------------------------
*/
Route::prefix('v1/payments')->name('api.payments.')->group(function () {
    Route::post('webhooks/{provider}', [WebhookController::class, 'handle'])->name('webhooks.handle');
});
