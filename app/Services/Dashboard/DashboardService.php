<?php

declare(strict_types=1);

namespace App\Services\Dashboard;

use App\Enums\CampaignStatus;
use App\Models\Campaign;
use App\Models\User;
use App\Modules\Payments\Enums\PaymentStatus;
use App\Modules\Payments\Models\Payment;
use Illuminate\Support\Collection;

class DashboardService
{
    public function getDataForUser(User $user): array
    {
        return [
            'stats' => $this->getStats($user),
            'featuredCampaign' => $this->getFeaturedCampaign($user),
            'recentCampaigns' => $this->getRecentCampaigns($user),
            'recentPayments' => $this->getRecentPayments($user),
        ];
    }

    protected function getStats(User $user): array
    {
        $campaigns = $user->campaigns()->withTrashed()->get();

        $totalCampaigns = $campaigns->count();
        $activeCampaigns = $campaigns->whereIn('status', [
            CampaignStatus::SENT_TO_CREATORS,
            CampaignStatus::IN_PROGRESS,
        ])->count();

        $underReview = $campaigns->where('status', CampaignStatus::UNDER_REVIEW)->count();
        $completed = $campaigns->where('status', CampaignStatus::COMPLETED)->count();
        $drafts = $campaigns->where('status', CampaignStatus::DRAFT)->count();
        $awaitingPayment = $campaigns->where('status', CampaignStatus::AWAITING_PAYMENT)->count();

        $totalInvested = Payment::where('user_id', $user->id)
            ->where('status', PaymentStatus::PAID)
            ->sum('amount_cents');

        return [
            'totalCampaigns' => $totalCampaigns,
            'activeCampaigns' => $activeCampaigns,
            'underReview' => $underReview,
            'completed' => $completed,
            'drafts' => $drafts,
            'awaitingPayment' => $awaitingPayment,
            'totalInvested' => (int) $totalInvested,
        ];
    }

    protected function getFeaturedCampaign(User $user): ?array
    {
        $campaign = $user->campaigns()
            #->whereIn('status', [
            #    CampaignStatus::SENT_TO_CREATORS,
            #    CampaignStatus::IN_PROGRESS,
            #])
            ->orderByDesc('updated_at')
            ->first();

        if (!$campaign) {
            return null;
        }

        return $this->formatCampaignCard($campaign);
    }

    protected function getRecentCampaigns(User $user, int $limit = 4): array
    {
        return $user->campaigns()
            ->orderByDesc('updated_at')
            ->limit($limit)
            ->get()
            ->map(fn (Campaign $c) => $this->formatCampaignCard($c))
            ->toArray();
    }

    protected function getRecentPayments(User $user, int $limit = 5): array
    {
        return Payment::where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get()
            ->map(fn (Payment $p) => [
                'id' => $p->id,
                'uuid' => $p->uuid,
                'amount' => $p->amount_cents,
                'status' => $p->status->toPresenterArray(),
                'paymentMethod' => $p->payment_method?->value,
                'createdAt' => $p->created_at?->format('d/m/Y H:i'),
                'paidAt' => $p->paid_at?->format('d/m/Y H:i'),
            ])
            ->toArray();
    }

    protected function formatCampaignCard(Campaign $campaign): array
    {
        return [
            'id' => $campaign->id,
            'uuid' => $campaign->uuid,
            'slug' => $campaign->slug,
            'title' => $campaign->name,
            'brandInstagram' => $campaign->brand_instagram,
            'budget' => $campaign->total_budget,
            'status' => $campaign->status->value,
            'statusLabel' => $campaign->status_label,
            'statusColor' => $campaign->status_color,
            'coverImage' => $campaign->cover_image_url,
            'slotsToApprove' => $campaign->slots_to_approve,
            'pricePerInfluencer' => (float) $campaign->price_per_influencer,
            'createdAt' => $campaign->created_at?->format('d/m/Y'),
            'updatedAt' => $campaign->updated_at?->format('d/m/Y'),
        ];
    }
}
