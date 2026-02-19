<?php

declare(strict_types=1);

namespace App\Services\Campaign;

use App\Enums\CampaignStatus;
use App\Models\Campaign;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CampaignService
{
    /**
     * @param int[] $creatorIds
     */
    public function approve(Campaign $campaign, array $creatorIds, int $reviewedBy): Campaign
    {
        if (count($creatorIds) === 0) {
            throw ValidationException::withMessages([
                'creator_ids' => 'Selecione ao menos um creator para aprovar a campanha.',
            ]);
        }

        $targetStatus = CampaignStatus::APPROVED;

        if (!$campaign->status->canTransitionTo($targetStatus)) {
            throw ValidationException::withMessages([
                'status' => sprintf(
                    'Nao e possivel aprovar campanha em status "%s".',
                    $campaign->status->value
                ),
            ]);
        }

        DB::transaction(function () use ($campaign, $creatorIds, $reviewedBy, $targetStatus): void {
            $campaign->approvedCreators()->sync($creatorIds);

            $campaign->transitionTo($targetStatus, [
                'reviewed_by' => $reviewedBy,
                'reviewed_at' => $campaign->reviewed_at ?? now(),
                'approved_at' => now(),
                'rejected_at' => null,
                'rejection_reason' => null,
                'approved_creators_count' => count($creatorIds),
            ]);
        });

        return $campaign->fresh(['user:id,name,email,avatar', 'approvedCreators:id,name,email,avatar,account_type']);
    }

    public function refuse(Campaign $campaign, string $reason, int $reviewedBy): Campaign
    {
        $reason = trim($reason);

        if ($reason === '') {
            throw ValidationException::withMessages([
                'reason_for_refusal' => 'Informe o motivo da recusa.',
            ]);
        }

        $targetStatus = CampaignStatus::REFUSED;

        if (!$campaign->status->canTransitionTo($targetStatus)) {
            throw ValidationException::withMessages([
                'status' => sprintf(
                    'Nao e possivel recusar campanha em status "%s".',
                    $campaign->status->value
                ),
            ]);
        }

        DB::transaction(function () use ($campaign, $reason, $reviewedBy, $targetStatus): void {
            $campaign->approvedCreators()->sync([]);

            $campaign->transitionTo($targetStatus, [
                'reviewed_by' => $reviewedBy,
                'reviewed_at' => $campaign->reviewed_at ?? now(),
                'approved_at' => null,
                'rejected_at' => now(),
                'rejection_reason' => $reason,
                'approved_creators_count' => 0,
            ]);
        });

        return $campaign->fresh(['user:id,name,email,avatar', 'approvedCreators:id,name,email,avatar,account_type']);
    }

    /**
     * @param int[]|null $creatorIds
     */
    public function updateStatus(
        Campaign $campaign,
        CampaignStatus $status,
        int $reviewedBy,
        ?array $creatorIds = null,
        ?string $reasonForRefusal = null,
    ): Campaign {
        if ($status === CampaignStatus::APPROVED) {
            return $this->approve($campaign, $creatorIds ?? [], $reviewedBy);
        }

        if ($status === CampaignStatus::REFUSED) {
            return $this->refuse($campaign, $reasonForRefusal ?? '', $reviewedBy);
        }

        if (!$campaign->status->canTransitionTo($status)) {
            throw ValidationException::withMessages([
                'status' => sprintf(
                    'Transicao invalida de "%s" para "%s".',
                    $campaign->status->value,
                    $status->value,
                ),
            ]);
        }

        if ($status === CampaignStatus::IN_PROGRESS && $campaign->approved_creators_count <= 0) {
            throw ValidationException::withMessages([
                'status' => 'Nao e possivel iniciar uma campanha sem creators aprovados.',
            ]);
        }

        $campaign->transitionTo($status, [
            'reviewed_by' => $reviewedBy,
        ]);

        return $campaign->fresh(['user:id,name,email,avatar', 'approvedCreators:id,name,email,avatar,account_type']);
    }
}
