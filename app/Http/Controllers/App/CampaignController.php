<?php

declare(strict_types=1);

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Http\Resources\CampaignResource;
use App\Models\Campaign;
use App\Services\Campaign\CampaignCheckoutService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CampaignController extends Controller
{
    public function __construct(
        protected CampaignCheckoutService $checkoutService
    ) {}

    /**
     * Lista de campanhas do usuário logado
     */
    public function index(Request $request): Response
    {
        return Inertia::render('app/campaigns/index');
    }

    /**
     * Formulário de criação de campanha
     */
    public function create(): Response
    {
        return Inertia::render('app/campaigns/create', [
            'publicationPlans' => config('campaigns.publication_plans'),
        ]);
    }

    /**
     * Visualizar detalhes de uma campanha
     */
    public function show(string $key): Response
    {
        $campaign = Campaign::byUser()
            ->byKey($key)
            ->firstOrFail();

        return Inertia::render('app/campaigns/edit', [
            'campaign' => new CampaignResource($campaign),
            'publicationPlans' => config('campaigns.publication_plans'),
        ]);
    }

    /**
     * Formulário de edição de campanha
     */
    public function edit(string $key): Response|RedirectResponse
    {
        $campaign = Campaign::byUser()
            ->byKey($key)
            ->firstOrFail();

        if (!$campaign->canBeEdited()) {
            return redirect()
                ->route('app.campaigns.show', $campaign->uuid)
                ->with('error', 'Esta campanha não pode ser editada.');
        }

        return Inertia::render('app/campaigns/edit', [
            'campaign' => new CampaignResource($campaign),
            'publicationPlans' => config('campaigns.publication_plans'),
        ]);
    }

    /**
     * Página de pagamento da campanha
     */
    public function pay(string $key): Response|RedirectResponse
    {
        $campaign = Campaign::byUser()
            ->byKey($key)
            ->firstOrFail();

        // Check if campaign can be submitted
        //TODO
        //if (!$campaign->isDraft()) {
        //    return redirect()
        //        ->route('app.campaigns.show', $campaign->uuid)
        //        ->with('error', 'Esta campanha já foi submetida.');
        //}

        $user = auth()->user();
        $walletBalance = $user->wallet?->balanceFloat ?? 0;

        // Calculate fees
        $publicationFee = $this->checkoutService->getPublicationFee($campaign->publication_plan);

        return Inertia::render('app/campaigns/pay', [
            'campaign' => $campaign,
            'wallet_balance' => $walletBalance,
            'publication_fee' => $publicationFee,
        ]);
    }

    /**
     * Processar checkout da campanha
     */
    public function checkout(Request $request, string $key): JsonResponse|RedirectResponse
    {
        $campaign = Campaign::byUser()
            ->byKey($key)
            ->firstOrFail();

        if (!$campaign->isDraft()) {
            return response()->json([
                'message' => 'Esta campanha já foi submetida.',
            ], 422);
        }

        $validated = $request->validate([
            'payment_method' => ['required', 'in:pix,card,wallet'],
            'use_wallet_balance' => ['nullable', 'boolean'],
            'wallet_amount' => ['nullable', 'numeric', 'min:0'],
            'card_number' => ['required_if:payment_method,card', 'nullable', 'string'],
            'card_holder_name' => ['required_if:payment_method,card', 'nullable', 'string'],
            'card_expiry' => ['required_if:payment_method,card', 'nullable', 'string'],
            'card_cvv' => ['required_if:payment_method,card', 'nullable', 'string'],
        ]);

        $result = $this->checkoutService->processCheckout(
            campaign: $campaign,
            user: $request->user(),
            payload: $validated
        );

        if ($result['success']) {
            return response()->json($result);
        }

        return response()->json([
            'message' => $result['message'] ?? 'Erro ao processar pagamento.',
            'errors' => $result['errors'] ?? [],
        ], 422);
    }
}
