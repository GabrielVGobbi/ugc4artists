<?php

declare(strict_types=1);

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Features;

class SecurityController extends Controller
{
    /**
     * Show the security settings form (password + 2FA).
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('settings/security', [
            'twoFactorEnabled' => ! is_null($user->two_factor_confirmed_at),
            'requiresConfirmation' => Features::optionEnabled(Features::twoFactorAuthentication(), 'confirm'),
        ]);
    }
}
