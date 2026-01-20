<?php

declare(strict_types=1);

namespace App\Http\Controllers\Auth;

use App\Exceptions\Auth\SocialAuthenticationException;
use App\Http\Controllers\Controller;
use App\Services\Auth\GoogleAuthService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    /**
     * GoogleAuthService instance.
     */
    public function __construct(
        private readonly GoogleAuthService $googleAuthService
    ) {}

    /**
     * Show the authentication page.
     *
     * @return Response
     */
    public function authenticate(): Response
    {
        return Inertia::render('auth/auth-google');
    }

    /**
     * Redirect to Google OAuth provider.
     *
     * @return RedirectResponse
     */
    public function redirect(): RedirectResponse
    {
        return Socialite::driver('google')->scopes(['profile', 'email'])
            ->redirect();
    }

    /**
     * Handle Google OAuth callback.
     *
     * @return RedirectResponse
     * @throws SocialAuthenticationException
     */
    public function handleGoogleCallback(): RedirectResponse
    {
        $user = $this->googleAuthService->handleCallback();

        return redirect()
            ->intended(route('app.dashboard'))
            ->with('success', "Bem-vindo(a), {$user->name}!");
    }
}
