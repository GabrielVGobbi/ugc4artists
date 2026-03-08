<?php

declare(strict_types=1);

namespace App\Services\Campaign;

use App\Enums\CampaignStatus;
use App\Models\Campaign;
use App\Models\User;

class CreatorCampaignService
{
    /**
     * Campanhas disponíveis para candidatura (aberta, ainda não aplicou).
     */
    public function getAvailable(User $user, int $perPage = 12): array
    {
        $paginator = Campaign::openForApplications()
            ->whereDoesntHave('approvedCreators', fn ($q) => $q->where('creator_id', $user->id))
            ->with('user:id,name,avatar')
            ->orderByDesc('applications_open_date')
            ->paginate($perPage);

        return [
            'data' => $paginator->items(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
                'total'        => $paginator->total(),
                'per_page'     => $paginator->perPage(),
            ],
        ];
    }

    /**
     * Campanhas aceitas/em andamento para o creator.
     */
    public function getActive(User $user): array
    {
        return $user->approvedCampaigns()
            ->whereIn('status', [
                CampaignStatus::SENT_TO_CREATORS,
                CampaignStatus::IN_PROGRESS,
            ])
            ->with('user:id,name,avatar')
            ->orderByDesc('updated_at')
            ->get()
            ->map(fn (Campaign $c) => $this->formatCard($c, withPivot: true))
            ->toArray();
    }

    /**
     * Campanhas concluídas para o creator.
     */
    public function getCompleted(User $user): array
    {
        return $user->approvedCampaigns()
            ->where('status', CampaignStatus::COMPLETED)
            ->with('user:id,name,avatar')
            ->orderByDesc('completed_at')
            ->limit(20)
            ->get()
            ->map(fn (Campaign $c) => $this->formatCard($c, withPivot: true))
            ->toArray();
    }

    public function formatCard(Campaign $campaign, bool $withPivot = false): array
    {
        $data = [
            'id'                  => $campaign->id,
            'uuid'                => $campaign->uuid,
            'slug'                => $campaign->slug,
            'title'               => $campaign->name,
            'brandInstagram'      => $campaign->brand_instagram,
            'budget'              => $campaign->total_budget,
            'pricePerInfluencer'  => (float) $campaign->price_per_influencer,
            'status'              => $campaign->status->value,
            'statusLabel'         => $campaign->status_label,
            'statusColor'         => $campaign->status_color,
            'coverImage'          => $campaign->cover_image_url,
            'slotsToApprove'      => $campaign->slots_to_approve,
            'contentPlatforms'    => $campaign->content_platforms ?? [],
            'applicationCloseDate' => $campaign->applications_close_date?->format('d/m/Y'),
            'createdAt'           => $campaign->created_at?->format('d/m/Y'),
            'updatedAt'           => $campaign->updated_at?->format('d/m/Y'),
        ];

        if ($withPivot && $campaign->pivot) {
            $data['submission'] = [
                'contentUrl'  => $campaign->pivot->content_url,
                'notes'       => $campaign->pivot->notes,
                'submittedAt' => $campaign->pivot->submitted_at
                    ? \Carbon\Carbon::parse($campaign->pivot->submitted_at)->format('d/m/Y H:i')
                    : null,
            ];
        }

        if ($campaign->relationLoaded('user') && $campaign->user) {
            $data['artist'] = [
                'id'     => $campaign->user->id,
                'name'   => $campaign->user->name,
                'avatar' => $campaign->user->avatar,
            ];
        }

        return $data;
    }
}
