<?php

declare(strict_types=1);

namespace App\Http\Controllers\App;

use App\Enums\CampaignStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Campaign\CampaignCheckoutRequest;
use App\Http\Resources\CampaignResource;
use App\Models\Campaign;
use App\Modules\Payments\Checkout\CheckoutResult;
use App\Services\Campaign\CampaignCheckoutService;
use App\Services\Campaign\CreatorCampaignService;
use App\Supports\Enums\Users\UserRoleType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CampaignController extends Controller
{
    public function __construct(
        protected CampaignCheckoutService $checkoutService,
        protected CreatorCampaignService $creatorCampaignService,
    ) {}

    /**
     * Lista de campanhas — artista vê suas campanhas criadas,
     * brand/creator vê campanhas disponíveis e aceitas.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        if ($user->account_type === UserRoleType::ARTIST) {
            return Inertia::render('app/campaigns/index');
        }

        return Inertia::render('app/campaigns/creator/index', [
            'available' => $this->creatorCampaignService->getAvailable($user),
            'active'    => $this->creatorCampaignService->getActive($user),
            'completed' => $this->creatorCampaignService->getCompleted($user),
        ]);
    }

    /**
     * Creator: visualizar detalhe de uma campanha disponível/aceita.
     */
    public function showForCreator(string $key): Response|RedirectResponse
    {
        $user = auth()->user();

        $campaign = Campaign::byKey($key)->firstOrFail();

        $isApproved = $campaign->approvedCreators()
            ->where('creator_id', $user->id)
            ->exists();

        return Inertia::render('app/campaigns/creator/show', [
            'campaign'   => new CampaignResource($campaign),
            'isApproved' => $isApproved,
        ]);
    }

    /**
     * Creator: candidatar-se a uma campanha aberta.
     */
    public function apply(Request $request, string $key): JsonResponse|RedirectResponse
    {
        $user     = $request->user();
        $campaign = Campaign::byKey($key)->firstOrFail();

        if (!$campaign->isSentToCreators()) {
            $message = 'Esta campanha não está aceitando candidaturas no momento.';
            if ($request->expectsJson()) {
                return response()->json(['message' => $message], 422);
            }

            return back()->with('error', $message);
        }

        $alreadyApplied = $campaign->approvedCreators()
            ->where('creator_id', $user->id)
            ->exists();

        if ($alreadyApplied) {
            $message = 'Você já se candidatou a esta campanha.';
            if ($request->expectsJson()) {
                return response()->json(['message' => $message], 422);
            }

            return back()->with('info', $message);
        }

        $campaign->approvedCreators()->attach($user->id);

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Candidatura enviada com sucesso!',
            ]);
        }

        return back()->with('success', 'Candidatura enviada com sucesso!');
    }

    /**
     * Creator: enviar conteúdo/entrega de uma campanha aceita.
     */
    public function submitDeliverable(Request $request, string $key): JsonResponse|RedirectResponse
    {
        $request->validate([
            'content_url'  => ['required', 'url'],
            'notes'        => ['nullable', 'string', 'max:1000'],
        ]);

        $user     = $request->user();
        $campaign = Campaign::byKey($key)->firstOrFail();

        $isApproved = $campaign->approvedCreators()
            ->where('creator_id', $user->id)
            ->exists();

        if (!$isApproved) {
            $message = 'Você não está aprovado nesta campanha.';
            if ($request->expectsJson()) {
                return response()->json(['message' => $message], 403);
            }

            return back()->with('error', $message);
        }

        // Update pivot with submission data
        $campaign->approvedCreators()->updateExistingPivot($user->id, [
            'content_url'    => $request->string('content_url'),
            'notes'          => $request->string('notes'),
            'submitted_at'   => now(),
        ]);

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Conteúdo enviado com sucesso! Aguardando revisão.',
            ]);
        }

        return back()->with('success', 'Conteúdo enviado com sucesso! Aguardando revisão.');
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
     * Visualizar detalhes de uma campanha (read-only para o dono da campanha / artista).
     */
    public function show(string $key): Response|RedirectResponse
    {
        $campaign = Campaign::byUser()
            ->byKey($key)
            ->firstOrFail();

        #if ($campaign->isAwaitingPayment()) {
        #    $pendingPayment = $campaign->getLatestPendingPayment();
        #    if ($pendingPayment) {
        #        return redirect()
        #            ->route('app.payments.show', $pendingPayment->uuid);
        #    }
        #}

        return Inertia::render('app/campaigns/show', [
            'campaign' => new CampaignResource($campaign),
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

        // Revert campaign to draft if not already in draft status
        // This allows users to edit campaigns that were refused or in other editable states
        if ($campaign->status !== CampaignStatus::DRAFT) {
            app(\App\Actions\Campaign\RevertToDraftAction::class)($campaign, [
                'user_id' => auth()->id(),
                'reason' => 'User requested to edit campaign',
            ]);
            $campaign->refresh(); // Reload campaign with updated status
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

        //todo: verificar se ja está pago Campanha já paga — redirecionar para detalhes
        if ($campaign->isUnderReview() || $campaign->isSentToCreators() || $campaign->isInProgress() || $campaign->isCompleted()) {
            return redirect()
                ->route('app.campaigns.show', $campaign->uuid)
                ->with('info', 'Esta campanha já foi paga.');
        }

        // Campanha aguardando PIX — redirecionar para página do pagamento pendente
        if ($campaign->isAwaitingPayment()) {
            $pendingPayment = $campaign->getLatestPendingPayment();
            if ($pendingPayment) {
                return redirect()
                    ->route('app.payments.show', $pendingPayment->uuid);
            }
        }

        // Campanha cancelada — não pode pagar
        if ($campaign->isCancelled()) {
            return redirect()
                ->route('app.campaigns.show', $campaign->uuid)
                ->with('error', 'Esta campanha foi cancelada.');
        }

        if (!$campaign->isComplete()) {
            return redirect()
                ->route('app.campaigns.edit', $campaign->uuid)
                ->with('error', 'Preencha todos os dados.');
        }

        $user = auth()->user();
        $walletBalance = $user->wallet?->balanceFloat ?? 0;

        // Mark campaign as awaiting payment if still in draft
        // This transitions the campaign from DRAFT to AWAITING_PAYMENT
        if ($campaign->status === CampaignStatus::DRAFT) {
            $campaign->markAwaitingPayment(); // Use existing model method
        }

        return Inertia::render('app/campaigns/pay', [
            'campaignData' => new CampaignResource($campaign->refresh()),
            'wallet_balance' => $walletBalance,
        ]);
    }

    /**
     * Processar checkout da campanha.
     */
    public function checkout(CampaignCheckoutRequest $request, string $key): JsonResponse|RedirectResponse
    {
        $campaign = Campaign::byUser()
            ->byKey($key)
            ->firstOrFail();

        $alreadyPaidMessage = 'Esta campanha já foi paga.';

        // Campanha já paga — retornar erro
        if ($campaign->isSentToCreators() || $campaign->isInProgress() || $campaign->isCompleted()) {
            if ($request->expectsJson()) {
                return response()->json(['message' => $alreadyPaidMessage], 422);
            }
            return redirect()
                ->route('app.campaigns.show', $campaign->uuid)
                ->with('error', $alreadyPaidMessage);
        }

        // Campanha cancelada — não pode fazer checkout
        if ($campaign->isCancelled()) {
            $message = 'Esta campanha foi cancelada.';
            if ($request->expectsJson()) {
                return response()->json(['message' => $message], 422);
            }
            return back()->with('error', $message);
        }

        // Campanha aguardando PIX — retornar pagamento pendente em vez de criar novo
        if ($campaign->isAwaitingPayment()) {
            $pendingPayment = $campaign->getLatestPendingPayment();
            if ($pendingPayment) {
                if ($request->expectsJson()) {
                    return response()->json([
                        'success' => true,
                        'status' => 'pending',
                        'message' => 'Você já possui um pagamento pendente. Aguarde a confirmação ou acesse a página do pagamento.',
                        'checkout' => ['payment' => ['uuid' => $pendingPayment->uuid]],
                        'redirect' => route('app.payments.show', $pendingPayment->uuid),
                    ]);
                }
                return redirect()->route('app.payments.show', $pendingPayment->uuid);
            }
        }

        $validated = $request->validated();

        $result = $this->checkoutService->processCheckout(
            campaign: $campaign,
            user: $request->user(),
            payload: $validated
        );

        // Non-gateway payment (wallet only or free campaign) — returns array
        if (is_array($result)) {
            return $this->handleArrayResponse($result, $request, $campaign);
        }

        // Gateway payment (PIX or Credit Card) — returns CheckoutResult
        if ($request->expectsJson()) {
            return $this->handleJsonResponse($result, $campaign);
        }

        return $this->handleInertiaResponse($result, $campaign);
    }

    /**
     * Handle array result (wallet-only or free campaign submit).
     */
    protected function handleArrayResponse(array $result, CampaignCheckoutRequest $request, Campaign $campaign): JsonResponse|RedirectResponse
    {
        if (!($result['success'] ?? false)) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => $result['message'] ?? 'Erro ao processar.',
                ], 422);
            }

            return back()->withErrors([
                'checkout' => $result['message'] ?? 'Erro ao processar.',
            ]);
        }

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'status' => 'paid',
                'message' => $result['message'],
                'redirect' => route('app.campaigns.show', $campaign->uuid),
            ]);
        }

        return redirect()->route('app.campaigns.show', $campaign->uuid)
            ->with('success', $result['message'] ?? 'Campanha enviada com sucesso!');
    }

    /**
     * Handle JSON/API response for gateway payments (CheckoutResult).
     */
    protected function handleJsonResponse(CheckoutResult $result, Campaign $campaign): JsonResponse
    {
        if ($result->isPaid()) {
            return response()->json([
                'success' => true,
                'status' => 'paid',
                'message' => 'Pagamento confirmado! Campanha enviada para revisão.',
                'redirect' => route('app.campaigns.show', $campaign->uuid),
            ]);
        }

        if ($result->isFailed()) {
            return response()->json([
                'success' => false,
                'message' => $result->getErrorMessage() ?? 'Pagamento recusado.',
            ], 422);
        }

        // Pending — return checkout data (PIX QR code, etc.)
        return response()->json([
            'success' => true,
            'status' => 'pending',
            'message' => 'Pagamento criado. Aguardando confirmação.',
            'checkout' => $result->toArray(),
            'redirect' => route('app.payments.show', $result->payment->uuid),
        ]);
    }

    /**
     * Handle Inertia response for gateway payments (CheckoutResult).
     */
    protected function handleInertiaResponse(CheckoutResult $result, Campaign $campaign): RedirectResponse
    {
        // Credit card paid — redirect to campaign details
        if ($result->isCreditCard() && $result->isPaid()) {
            return redirect()->route('app.campaigns.show', $campaign->uuid)
                ->with('success', 'Pagamento confirmado! Campanha enviada para revisão.');
        }

        // Credit card failed — back with errors
        if ($result->isCreditCard() && $result->isFailed()) {
            return back()->withErrors([
                'card' => $result->getErrorMessage() ?? 'Pagamento recusado. Verifique os dados do cartão.',
            ]);
        }

        // PIX — redirect to payment page (QR code)
        if ($result->isPix()) {
            return redirect()->route('app.payments.show', $result->payment->uuid);
        }

        // Other methods — checkout URL or campaign details
        if ($result->checkoutUrl) {
            return Inertia::location($result->checkoutUrl);
        }

        return redirect()->route('app.campaigns.show', $campaign->uuid)
            ->with('info', 'Pagamento criado. Aguardando confirmação.');
    }
}
