<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureOnboardingCompleted
{
    /**
     * Handle an incoming request.
     *
     * Este middleware é aplicado apenas nas rotas que requerem onboarding completo.
     * As rotas de onboarding não têm este middleware aplicado.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!auth()->check()) {
            return $next($request);
        }

        $user = $request->user();

        // Se o onboarding não foi completado, redireciona para o onboarding
        if (empty($user->onboarding_completed_at)) {
            return redirect()->route('app.onboarding.index');
        }

        return $next($request);
    }
}
