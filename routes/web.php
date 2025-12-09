<?php

use App\Http\Controllers\HomeController;
use App\Http\Controllers\WaitlistRegistrationController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use Illuminate\Support\Facades\URL;

Route::get('/sitemap.xml', function () {
    $urls = [
        [
            'loc' => URL::to('/'),
            'lastmod' => now()->toAtomString(),
            'changefreq' => 'daily',
            'priority' => '1.0',
        ],
        //[
        //    'loc' => URL::to('/para-artistas'),
        //    'lastmod' => now()->toAtomString(),
        //    'changefreq' => 'weekly',
        //    'priority' => '0.8',
        //],
        //[
        //    'loc' => URL::to('/para-marcas'),
        //    'lastmod' => now()->toAtomString(),
        //    'changefreq' => 'weekly',
        //    'priority' => '0.8',
        //],
        //[
        //    'loc' => URL::to('/contato'),
        //    'lastmod' => now()->toAtomString(),
        //    'changefreq' => 'monthly',
        //    'priority' => '0.5',
        //],
    ];

    $xml = view('sitemap', compact('urls'));

    return response($xml, 200)
        ->header('Content-Type', 'application/xml');
})->name('sitemap');

Route::get('/', [HomeController::class, 'index'])->name('home');

Route::get('/waitlist', [WaitlistRegistrationController::class, 'index']);
Route::post('/waitlist', [WaitlistRegistrationController::class, 'store'])->name('waitlist.store');
Route::get('/regulamento', [WaitlistRegistrationController::class, 'regulation'])->name('waitlist.regulation');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

require __DIR__ . '/settings.php';
