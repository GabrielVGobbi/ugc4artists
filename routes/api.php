<?php

use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Admin\UsersController;
use App\Http\Controllers\App\WalletAppController as WalletApp;
use App\Http\Controllers\Api\AccountApiController;
use App\Http\Controllers\Api\AuthenticateApiController;
use App\Http\Controllers\Api\CampaignApiController;
use App\Http\Controllers\Api\NotificationController;
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
    | Notifications
    |--------------------------------------------------------------------------
    */
    Route::prefix('notifications')->name('notifications.')->group(function () {
        Route::get('/', [NotificationController::class, 'index'])->name('index');
        Route::get('/unread-count', [NotificationController::class, 'unreadCount'])->name('unread-count');
        Route::post('/{notification}/read', [NotificationController::class, 'markAsRead'])->name('mark-read');
        Route::post('/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('mark-all-read');
        Route::delete('/clear-read', [NotificationController::class, 'clearRead'])->name('clear-read');
        Route::delete('/{notification}', [NotificationController::class, 'destroy'])->name('destroy');
    });

    /*
    |--------------------------------------------------------------------------
    | Wallet
    |--------------------------------------------------------------------------
    */
    Route::prefix('wallet')->name('wallet.')->group(function () {
        Route::get('/transactions', [WalletApp::class, 'transactions'])->name('transactions');
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

    /*
    |--------------------------------------------------------------------------
    | Campaigns
    |--------------------------------------------------------------------------
    */
    Route::prefix('campaigns')->name('campaigns.')->group(function () {
        Route::get('/', [CampaignApiController::class, 'index'])->name('index');
        Route::get('/stats', [CampaignApiController::class, 'stats'])->name('stats');
        Route::post('/', [CampaignApiController::class, 'store'])->name('store');
        Route::get('/{key}', [CampaignApiController::class, 'show'])->name('show');
        Route::put('/{key}', [CampaignApiController::class, 'update'])->name('update');
        Route::delete('/{key}', [CampaignApiController::class, 'destroy'])->name('destroy');
        Route::post('/{key}/submit', [CampaignApiController::class, 'submit'])->name('submit');
        Route::post('/{key}/duplicate', [CampaignApiController::class, 'duplicate'])->name('duplicate');
        Route::post('/{key}/checkout', [CampaignApiController::class, 'checkout'])->name('checkout');
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
