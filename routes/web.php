<?php

use App\Http\Controllers\HomeController;
use App\Http\Controllers\WaitlistRegistrationController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\URL;
use Inertia\Inertia;
use Laravel\Fortify\Features;

/*
|--------------------------------------------------------------------------
| Landing page
|--------------------------------------------------------------------------
*/

Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/regulamento', [HomeController::class, 'regulamento'])->name('regulamento');
Route::get('/svg-demo', function () {
    return Inertia::render('svg-icons-demo');
})->name('svg.demo');
Route::get('/waitlist', [WaitlistRegistrationController::class, 'index']);
Route::get('/formulario', [WaitlistRegistrationController::class, 'index']);
Route::post('/waitlist', [WaitlistRegistrationController::class, 'store'])->name('waitlist.store');

require __DIR__ . '/auth.php';
require __DIR__ . '/app.php';
require __DIR__ . '/admin.php';
require __DIR__ . '/settings.php';

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
