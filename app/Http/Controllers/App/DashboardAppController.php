<?php

declare(strict_types=1);

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Http\Requests\Onboarding\CompleteOnboardingRequest;
use App\Http\Requests\Onboarding\SaveOnboardingProgressRequest;
use App\Services\Onboarding\OnboardingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardAppController extends Controller
{
    public function __construct(
        private readonly OnboardingService $onboardingService
    ) {}

    /**
     * Display the admin dashboard.
     */
    public function index(): Response
    {
        // Mock data - será substituído por dados reais do banco posteriormente
        $stats = [
            'totalCampaigns' => 142,
            'activeCampaigns' => 38,
            'totalArtists' => 1284,
            'totalBrands' => 76,
            'totalRevenue' => 842350,
            'pendingProposals' => 23,
            'revenueGrowth' => 12.5,
            'campaignsGrowth' => 8.3,
        ];

        $topArtists = [
            [
                'id' => 1,
                'name' => 'Marina Silva',
                'genre' => 'Pop/Eletrônico',
                'avatar' => 'https://ui-avatars.com/api/?name=Marina+Silva&background=FF4D00&color=fff',
                'matchPercentage' => 98,
                'isActive' => true,
                'engagement' => '245K',
            ],
            [
                'id' => 2,
                'name' => 'Pedro Santos',
                'genre' => 'Hip Hop/Trap',
                'avatar' => 'https://ui-avatars.com/api/?name=Pedro+Santos&background=0A0A0A&color=fff',
                'matchPercentage' => 94,
                'isActive' => false,
                'engagement' => '189K',
            ],
            [
                'id' => 3,
                'name' => 'Julia Mendes',
                'genre' => 'MPB/Indie',
                'avatar' => 'https://ui-avatars.com/api/?name=Julia+Mendes&background=FF4D00&color=fff',
                'matchPercentage' => 91,
                'isActive' => true,
                'engagement' => '167K',
            ],
        ];

        $recentCampaigns = [
            [
                'id' => 1,
                'title' => 'Verão Autêntico 2025',
                'brand' => 'Natura',
                'budget' => 'R$ 85.000',
                'status' => 'Live',
                'participants' => 12,
                'thumbnail' => 'https://picsum.photos/seed/campaign1/400/300',
            ],
            [
                'id' => 2,
                'title' => 'Urban Style Collection',
                'brand' => 'Adidas',
                'budget' => 'R$ 120.000',
                'status' => 'Live',
                'participants' => 18,
                'thumbnail' => 'https://picsum.photos/seed/campaign2/400/300',
            ],
        ];

        return Inertia::render('app/dashboard', [
            'stats' => $stats,
            'topArtists' => $topArtists,
            'recentCampaigns' => $recentCampaigns,
        ]);
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
