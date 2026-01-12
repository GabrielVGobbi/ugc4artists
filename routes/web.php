<?php

use App\Http\Controllers\HomeController;
use App\Http\Controllers\WaitlistRegistrationController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
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
Route::get('/regulamento', [HomeController::class, 'regulamento'])->name('regulamento');

Route::get('/waitlist', [WaitlistRegistrationController::class, 'index']);
Route::get('/formulario', [WaitlistRegistrationController::class, 'index']);
Route::post('/waitlist', [WaitlistRegistrationController::class, 'store'])->name('waitlist.store');

// Disable login and register temporarily - redirect to home
Route::get('/login', fn() => redirect()->route('home'))->name('login');
Route::post('/login', fn() => redirect()->route('home'));
Route::get('/register', fn() => redirect()->route('home'))->name('register');
Route::post('/register', fn() => redirect()->route('home'));

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

// Admin Routes
Route::middleware(['auth', 'verified'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');
    
    // Placeholder routes - to be implemented
    Route::get('/campaigns', fn() => Inertia::render('admin/campaigns'))->name('campaigns');
    Route::get('/artists', fn() => Inertia::render('admin/artists'))->name('artists');
    Route::get('/brands', fn() => Inertia::render('admin/brands'))->name('brands');
    Route::get('/proposals', fn() => Inertia::render('admin/proposals'))->name('proposals');
    Route::get('/analytics', fn() => Inertia::render('admin/analytics'))->name('analytics');
    Route::get('/inbox', fn() => Inertia::render('admin/inbox'))->name('inbox');
    Route::get('/payments', fn() => Inertia::render('admin/payments'))->name('payments');
    Route::get('/studio', fn() => Inertia::render('admin/studio'))->name('studio');
    Route::get('/settings', fn() => Inertia::render('admin/settings'))->name('settings');
});

require __DIR__ . '/settings.php';
