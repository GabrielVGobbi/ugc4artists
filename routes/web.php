<?php

use App\Http\Controllers\WaitlistRegistrationController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('landing-page/index', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::get('/waitlist', [WaitlistRegistrationController::class, 'index']);
Route::post('/waitlist', [WaitlistRegistrationController::class, 'store'])->name('waitlist.store');
Route::get('/regulamento', [WaitlistRegistrationController::class, 'regulation'])->name('waitlist.regulation');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

require __DIR__ . '/settings.php';
