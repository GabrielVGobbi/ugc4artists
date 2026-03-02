<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\Admin;

use App\Enums\CampaignStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Campaign\ApproveCampaignRequest;
use App\Http\Requests\Campaign\RefuseCampaignRequest;
use App\Http\Requests\Campaign\UpdateCampaignStatusRequest;
use App\Http\Resources\CampaignResource;
use App\Models\Campaign;
use App\Models\User;
use App\Services\Campaign\CampaignService;
use App\Supports\Enums\Users\UserRoleType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CampaignModerationApiController extends Controller
{
    public function __construct(private CampaignService $campaignService) {}

    public function index(Request $request): JsonResponse
    {
        $perPage = min(max((int) $request->integer('per_page', 20), 1), 100);
        $search = trim((string) $request->input('search', ''));

        // Admin-visible statuses (UNDER_REVIEW onwards)
        $adminStatuses = [
            CampaignStatus::UNDER_REVIEW,
            CampaignStatus::APPROVED,
            CampaignStatus::REFUSED,
            CampaignStatus::SENT_TO_CREATORS,
            CampaignStatus::IN_PROGRESS,
            CampaignStatus::COMPLETED,
            CampaignStatus::CANCELLED,
        ];

        $query = Campaign::query()
            ->with(['user:id,name,email,avatar', 'approvedCreators:id,name,email,avatar,account_type'])
            ->whereIn('status', array_map(fn(CampaignStatus $s): string => $s->value, $adminStatuses))
            ->latest('created_at');

        $statusParam = $request->input('status');
        if (is_string($statusParam) && $statusParam !== '') {
            $statuses = collect(explode(',', $statusParam))
                ->map(fn(string $value): ?CampaignStatus => CampaignStatus::tryFrom(trim($value)))
                ->filter(fn(?CampaignStatus $s): bool => $s !== null && in_array($s, $adminStatuses, true))
                ->values()
                ->all();

            if (count($statuses) > 0) {
                $query->whereIn('status', array_map(fn(CampaignStatus $status): string => $status->value, $statuses));
            }
        }

        if ($search !== '') {
            $query->where(function ($builder) use ($search): void {
                $builder->where('name', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%")
                    ->orWhere('brand_instagram', 'like', "%{$search}%");
            });
        }

        return response()->json(CampaignResource::collection($query->paginate($perPage)));
    }

    public function creators(Request $request): JsonResponse
    {
        $search = trim((string) $request->input('search', ''));
        $limit = min(max((int) $request->integer('limit', 20), 1), 50);

        $query = User::query()
            ->select(['id', 'uuid', 'name', 'email', 'avatar', 'account_type'])
            ->where(function ($builder): void {
                $builder->where('account_type', UserRoleType::CREATOR)
                    ->orWhereHas('roles', fn($q) => $q->where('slug', 'creator'));
            })
            ->orderBy('name')
            ->limit($limit);

        if ($search !== '') {
            $query->where(function ($builder) use ($search): void {
                $builder->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        return response()->json([
            'data' => $query->get()->map(fn(User $user): array => [
                'id' => $user->id,
                'uuid' => $user->uuid,
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar,
            ])->all(),
        ]);
    }

    public function approve(ApproveCampaignRequest $request, Campaign $campaign): JsonResponse
    {
        $updatedCampaign = $this->campaignService->approve(
            campaign: $campaign,
            creatorIds: $request->creatorIds(),
            reviewedBy: (int) $request->user()->id,
        );

        return response()->json([
            'message' => 'Campanha aprovada com sucesso.',
            'campaign' => new CampaignResource($updatedCampaign),
        ]);
    }

    public function refuse(RefuseCampaignRequest $request, Campaign $campaign): JsonResponse
    {
        $updatedCampaign = $this->campaignService->refuse(
            campaign: $campaign,
            reason: $request->reason(),
            reviewedBy: (int) $request->user()->id,
        );

        return response()->json([
            'message' => 'Campanha recusada com sucesso.',
            'campaign' => new CampaignResource($updatedCampaign),
        ]);
    }

    public function updateStatus(UpdateCampaignStatusRequest $request, Campaign $campaign): JsonResponse
    {
        $updatedCampaign = $this->campaignService->updateStatus(
            campaign: $campaign,
            status: $request->status(),
            reviewedBy: (int) $request->user()->id,
            creatorIds: $request->creatorIds(),
            reasonForRefusal: $request->reason(),
        );

        return response()->json([
            'message' => 'Status da campanha atualizado com sucesso.',
            'campaign' => new CampaignResource($updatedCampaign),
        ]);
    }
}
