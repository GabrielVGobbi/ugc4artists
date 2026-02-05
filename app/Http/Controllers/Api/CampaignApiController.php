<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Campaign\StoreCampaignRequest;
use App\Http\Requests\Campaign\UpdateCampaignRequest;
use App\Http\Requests\Checkout\CheckoutRequest;
use App\Http\Resources\CampaignResource;
use App\Models\Campaign;
use App\Services\Campaign\CampaignCheckoutService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CampaignApiController extends Controller
{

    public function __construct(
        protected CampaignCheckoutService $checkoutService
    ) {}

    /**
     * Lista paginada de campanhas do usuário
     */
    public function index(Request $request)
    {
        $perPage = min((int) $request->get('per_page', 15), 50);
        $status = $request->get('status');
        $search = $request->get('search');

        $query = Campaign::byUser()
            ->with('user:id,name,avatar')
            ->latest('created_at');

        if ($status) {
            $query->byStatus($status);
        }

        if ($search) {
            $query->search($search);
        }

        $campaigns = $query->paginate($perPage);

        return CampaignResource::collection($query->paginate($perPage));
        #return response()->json($campaigns);
    }

    /**
     * Criar nova campanha
     */
    public function store(StoreCampaignRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id();
        $data['status'] = 'draft';

        // Upload da imagem de capa
        if ($request->hasFile('cover_image')) {
            $path = $request->file('cover_image')->store('campaigns/covers', 'public');
            $data['cover_image'] = $path;
        }

        $campaign = Campaign::create($data);

        return response()->json([
            'message' => 'Campanha criada com sucesso!',
            'campaign' => $campaign,
        ], 201);
    }

    /**
     * Visualizar campanha
     */
    public function show(string $key): JsonResponse
    {
        $campaign = Campaign::byUser()
            ->byKey($key)
            ->with('user:id,name,avatar')
            ->firstOrFail();

        return response()->json(['campaign' => $campaign]);
    }

    /**
     * Atualizar campanha
     */
    public function update(UpdateCampaignRequest $request, string $key): JsonResponse
    {
        $campaign = Campaign::byUser()
            ->byKey($key)
            ->firstOrFail();

        //TODO
        #if (!$campaign->canBeEdited()) {
        #    return response()->json([
        #        'message' => 'Esta campanha não pode ser editada.',
        #    ], 422);
        #}

        $data = $request->validated();

        // Tratamento da imagem de capa
        $this->handleCoverImage($request, $campaign, $data);

        $campaign->update($data);

        return response()->json([
            'message' => 'Campanha atualizada com sucesso!',
            'campaign' => new CampaignResource($campaign->fresh()),
        ]);
    }

    /**
     * Trata upload, exclusão e troca de imagem de capa
     */
    private function handleCoverImage(UpdateCampaignRequest $request, Campaign $campaign, array &$data): void
    {
        $oldImage = $campaign->cover_image;
        $hasOldImage = $oldImage && !str_starts_with($oldImage, 'http');

        // Caso 1: Nova imagem enviada (upload)
        if ($request->hasFile('cover_image')) {
            // Remove a imagem anterior se existir
            if ($hasOldImage) {
                Storage::disk('public')->delete($oldImage);
            }

            $path = $request->file('cover_image')->store('campaigns/covers', 'public');
            $data['cover_image'] = $path;
            return;
        }

        // Caso 2: Requisição explícita para remover imagem (cover_image = null ou remove_cover_image = true)
        $shouldRemove = $request->has('remove_cover_image') && $request->boolean('remove_cover_image');
        $isExplicitNull = $request->has('cover_image') && $request->input('cover_image') === null;

        if ($shouldRemove || $isExplicitNull) {
            if ($hasOldImage) {
                Storage::disk('public')->delete($oldImage);
            }
            $data['cover_image'] = null;
            return;
        }

        // Caso 3: Não enviou nada sobre imagem - mantém a atual
        unset($data['cover_image']);
    }

    /**
     * Excluir campanha (soft delete)
     */
    public function destroy(string $key): JsonResponse
    {
        $campaign = Campaign::byUser()
            ->byKey($key)
            ->firstOrFail();

        if (!$campaign->canBeEdited()) {
            return response()->json([
                'message' => 'Esta campanha não pode ser excluída.',
            ], 422);
        }

        $campaign->delete();

        return response()->json([
            'message' => 'Campanha excluída com sucesso!',
        ]);
    }

    /**
     * Submeter campanha para revisão
     */
    public function submit(string $key): JsonResponse
    {
        $campaign = Campaign::byUser()
            ->byKey($key)
            ->firstOrFail();

        if (!$campaign->submit()) {
            return response()->json([
                'message' => 'Campanha não pode ser submetida. Verifique se todos os campos obrigatórios estão preenchidos.',
            ], 422);
        }

        return response()->json([
            'message' => 'Campanha enviada para revisão com sucesso!',
            'campaign' => $campaign->fresh(),
        ]);
    }

    /**
     * Duplicar campanha
     */
    public function duplicate(string $key): JsonResponse
    {
        $campaign = Campaign::byUser()
            ->byKey($key)
            ->firstOrFail();

        $newCampaign = $campaign->replicate([
            'uuid',
            'slug',
            'status',
            'submitted_at',
            'approved_at',
            'rejected_at',
            'rejection_reason',
            'reviewed_by',
            'applications_count',
            'approved_creators_count',
            'views_count',
        ]);

        $newCampaign->name = $campaign->name . ' (Cópia)';
        $newCampaign->status = 'draft';
        $newCampaign->save();

        return response()->json([
            'message' => 'Campanha duplicada com sucesso!',
            'campaign' => $newCampaign,
        ], 201);
    }

    /**
     * Estatísticas das campanhas
     */
    public function stats(): JsonResponse
    {
        $userId = auth()->id();

        $stats = [
            'total' => Campaign::byUser($userId)->count(),
            'draft' => Campaign::byUser($userId)->byStatus('draft')->count(),
            'pending_review' => Campaign::byUser($userId)->byStatus('pending_review')->count(),
            'active' => Campaign::byUser($userId)->byStatus('active')->count(),
            'completed' => Campaign::byUser($userId)->byStatus('completed')->count(),
            'total_budget' => Campaign::byUser($userId)->published()->sum(\DB::raw('slots_to_approve * price_per_influencer')),
            'total_applications' => Campaign::byUser($userId)->sum('applications_count'),
        ];

        return response()->json($stats);
    }

    /**
     * Processar checkout da campanha.
     * Usa CheckoutRequest unificado (service=campaign) com dados de faturamento.
     */
    public function checkout(CheckoutRequest $request, string $key): JsonResponse|RedirectResponse
    {
        $campaign = Campaign::byUser()
            ->byKey($key)
            ->firstOrFail();

        if (!$campaign->isDraft()) {
            return response()->json([
                'message' => 'Esta campanha já foi submetida.',
            ], 422);
        }

        $validated = $request->validated();

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
