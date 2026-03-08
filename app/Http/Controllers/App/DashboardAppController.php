<?php

declare(strict_types=1);

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Http\Requests\Onboarding\CompleteOnboardingRequest;
use App\Http\Requests\Onboarding\SaveOnboardingProgressRequest;
use App\Services\Dashboard\CreatorDashboardService;
use App\Services\Dashboard\DashboardService;
use App\Services\Onboarding\OnboardingService;
use App\Supports\Enums\Users\UserRoleType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardAppController extends Controller
{
    public function __construct(
        private readonly OnboardingService $onboardingService,
        private readonly DashboardService $dashboardService,
        private readonly CreatorDashboardService $creatorDashboardService,
    ) {}

    /**
     * Display the app dashboard.
     * Dispatches to the appropriate Inertia page based on the user's account_type.
     */
    public function index(): Response
    {
        $user = auth()->user();

        if ($user->account_type === UserRoleType::ARTIST) {
            $data = $this->dashboardService->getDataForUser($user);

            return Inertia::render('app/dashboard', $data);
        }

        // brand or creator
        $data = $this->creatorDashboardService->getDataForUser($user);

        return Inertia::render('app/dashboard-creator', $data);
    }

    /**
     * Exibe a página de onboarding.
     */
    public function onboarding(Request $request): Response|RedirectResponse
    {
        $user = $request->user();

        // Se já completou o onboarding, redireciona para o dashboard
        if ($user->hasCompletedOnboarding()) {
            return redirect()->route('app.dashboard');
        }

        $progress = $this->onboardingService->getProgress($user);

        return Inertia::render('app/onboarding', [
            'savedProgress' => $progress,
            'userName' => $user->name,
        ]);
    }

    /**
     * Salva o progresso do onboarding no cache.
     */
    public function saveOnboardingProgress(SaveOnboardingProgressRequest $request): JsonResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        $progress = $this->onboardingService->saveProgress(
            $user,
            $validated['data'],
            $validated['current_step']
        );

        return response()->json([
            'success' => true,
            'progress' => $progress,
        ]);
    }

    /**
     * Completa o onboarding e salva no banco.
     */
    public function completeOnboarding(CompleteOnboardingRequest $request)
    {
        $user = $request->user();
        $validated = $request->validated();

        $this->onboardingService->completeOnboarding($user, $validated);

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Bem-vindo! Seu perfil foi configurado com sucesso.',
            ]);
        }

        return redirect()->route('app.dashboard')->with('success', 'Bem-vindo! Seu perfil foi configurado com sucesso.');
    }

    public function studio()
    {
        return Inertia::render('app/studio');
    }
}
