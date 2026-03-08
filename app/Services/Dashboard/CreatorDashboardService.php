<?php

declare(strict_types=1);

namespace App\Services\Dashboard;

use App\Enums\CampaignStatus;
use App\Models\Campaign;
use App\Models\User;
use App\Modules\Payments\Enums\PaymentStatus;
use App\Modules\Payments\Models\Payment;
use Bavix\Wallet\Models\Transaction;

class CreatorDashboardService
{
    public function getDataForUser(User $user): array
    {
        return [
            'stats'            => $this->getStats($user),
            'activeCampaigns'  => $this->getActiveCampaigns($user),
            'availableCampaigns' => $this->getAvailableCampaigns($user),
            'recentEarnings'   => $this->getRecentEarnings($user),
        ];
    }

    protected function getStats(User $user): array
    {
        $accepted = $user->approvedCampaigns()
            ->withTrashed()
            ->get();

        $totalAccepted  = $accepted->count();
        $inProgress     = $accepted->whereIn('status', [
            CampaignStatus::IN_PROGRESS,
            CampaignStatus::SENT_TO_CREATORS,
        ])->count();
        $completed      = $accepted->where('status', CampaignStatus::COMPLETED)->count();

        $availableCount = Campaign::openForApplications()
            ->whereDoesntHave('approvedCreators', fn ($q) => $q->where('creator_id', $user->id))
            ->count();

        $totalEarned = (int) Transaction::where('wallet_id', $user->wallet?->id)
            ->where('type', 'deposit')
            ->where('confirmed', true)
            ->where('meta->type', 'campaign_payment')
            ->sum('amount');

        $pendingEarnings = (int) Transaction::where('wallet_id', $user->wallet?->id)
            ->where('type', 'deposit')
            ->where('confirmed', false)
            ->where('meta->type', 'campaign_payment')
            ->sum('amount');

        return [
            'totalAccepted'   => $totalAccepted,
            'inProgress'      => $inProgress,
            'completed'       => $completed,
            'available'       => $availableCount,
            'totalEarned'     => $totalEarned,
            'pendingEarnings' => $pendingEarnings,
            'balanceFloat'    => $user->wallet?->balanceFloat ?? 0,
            'balanceFormatted' => toCurrency($user->wallet?->balanceFloat ?? 0),
        ];
    }

    protected function getActiveCampaigns(User $user, int $limit = 5): array
    {
        return $user->approvedCampaigns()
            ->whereIn('status', [
                CampaignStatus::SENT_TO_CREATORS,
                CampaignStatus::IN_PROGRESS,
            ])
            ->orderByDesc('updated_at')
            ->limit($limit)
            ->get()
            ->map(fn (Campaign $c) => $this->formatCampaignCard($c))
            ->toArray();
    }

    protected function getAvailableCampaigns(User $user, int $limit = 6): array
    {
        return Campaign::openForApplications()
            ->whereDoesntHave('approvedCreators', fn ($q) => $q->where('creator_id', $user->id))
            ->with('user:id,name,avatar')
            ->orderByDesc('applications_open_date')
            ->limit($limit)
            ->get()
            ->map(fn (Campaign $c) => $this->formatCampaignCard($c, withArtist: true))
            ->toArray();
    }

    protected function getRecentEarnings(User $user, int $limit = 5): array
    {
        return Transaction::where('wallet_id', $user->wallet?->id)
            ->where('type', 'deposit')
            ->where('confirmed', true)
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get()
            ->map(fn (Transaction $tx) => [
                'id'          => $tx->uuid,
                'amount'      => $tx->amount,
                'amountFloat' => $tx->amountFloat,
                'amountFormatted' => toCurrency($tx->amountFloat),
                'description' => $tx->meta['description'] ?? 'Recebimento',
                'type'        => $tx->meta['type'] ?? 'other',
                'createdAt'   => $tx->created_at?->format('d/m/Y H:i'),
            ])
            ->toArray();
    }

    protected function formatCampaignCard(Campaign $campaign, bool $withArtist = false): array
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

        if ($withArtist && $campaign->relationLoaded('user')) {
            $data['artist'] = [
                'id'     => $campaign->user->id,
                'name'   => $campaign->user->name,
                'avatar' => $campaign->user->avatar,
            ];
        }

        return $data;
    }
}
