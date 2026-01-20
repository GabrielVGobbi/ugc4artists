<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureOnboardingCompleted
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!auth()->check()) {
            return $next($request);
        }

        $user = $request->user();

        if (empty($user->onboarding_completed_at)) {
            if (!$request->routeIs('onboarding.*')) {
                return redirect()->route('app.onboarding.index');
            }
        }

        return $next($request);
    }
}
