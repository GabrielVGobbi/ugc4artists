<?php

use App\Http\Controllers\Settings\AddressController;
use App\Http\Controllers\Settings\NotificationSettingsController;
use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\SecurityController;
use App\Http\Controllers\Settings\TwoFactorAuthenticationController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->prefix('app/settings')->name('app.settings.')->group(function () {
    Route::redirect('/', '/app/settings/profile');

    // Profile
    Route::get('profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::post('profile/avatar', [ProfileController::class, 'updateAvatar'])->name('profile.avatar');
    Route::delete('profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Notifications
    Route::get('notifications', [NotificationSettingsController::class, 'edit'])->name('notifications.edit');
    Route::patch('notifications', [NotificationSettingsController::class, 'update'])->name('notifications.update');

    // Address (billing)
    Route::get('address', [AddressController::class, 'edit'])->name('address.edit');
    Route::patch('address', [AddressController::class, 'update'])->name('address.update');

    // Security (unified password + 2FA)
    Route::get('security', [SecurityController::class, 'edit'])->name('security.edit');
    Route::put('password', [PasswordController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');
    Route::get('two-factor', [TwoFactorAuthenticationController::class, 'show'])
        ->name('two-factor.show');
});
