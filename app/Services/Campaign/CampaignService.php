<?php

declare(strict_types=1);

namespace App\Services\Campaign;

use App\Actions\Campaign\ApproveAction;
use App\Actions\Campaign\CancelAction;
use App\Actions\Campaign\CompleteAction;
use App\Actions\Campaign\RefuseAction;
use App\Actions\Campaign\RevertToDraftAction;
use App\Actions\Campaign\SendToCreatorsAction;
use App\Actions\Campaign\StartAction;
use App\Enums\CampaignStatus;
use App\Http\Requests\Campaign\CampaignCheckoutRequest;
use App\Models\Campaign;
use Illuminate\Validation\ValidationException;

/**
 * Campaign service that delegates status transitions to Action classes.
 *
 * This service acts as a facade for campaign operations, providing a consistent
 * API while delegating actual business logic to single-purpose Action classes.
 *
 * All status transitions are handled by Actions, which provide:
 * - Business rule validation
 * - Database transaction handling
 * - Event dispatching
 * - Audit logging
 *
 * @see \App\Actions\Campaign Documentation in docs/CAMPAIGN_ACTIONS.md
 */
class CampaignService
{
    public function __construct(
        protected CampaignCheckoutService $checkoutService,
    ) {}

    /**
     * Approve a campaign and assign creators.
     *
     * Delegates to ApproveAction.
     *
     * @param Campaign $campaign The campaign to approve
     * @param int[] $creatorIds IDs of creators to assign
     * @param int $reviewedBy Admin user ID
     * @return Campaign Freshly loaded campaign with relations
     *
     * @throws ValidationException If validation fails
     */
    public function approve(Campaign $campaign, int $reviewedBy): Campaign
    {
        $result = app(ApproveAction::class)($campaign, [
            'reviewed_by' => $reviewedBy,
        ]);

        return $result->campaign;
    }

    /**
     * Refuse a campaign with a reason.
     *
     * Delegates to RefuseAction.
     *
     * @param Campaign $campaign The campaign to refuse
     * @param string $reason Refusal reason (will be shown to campaign owner)
     * @param int $reviewedBy Admin user ID
     * @return Campaign Freshly loaded campaign with relations
     *
     * @throws ValidationException If validation fails
     */
    public function refuse(Campaign $campaign, string $reason, int $reviewedBy): Campaign
    {
        $result = app(RefuseAction::class)($campaign, [
            'reason' => $reason,
            'reviewed_by' => $reviewedBy,
        ]);

        return $result->campaign;
    }

    /**
     * Update campaign status using generic method.
     *
     * This method delegates to specific Actions based on the target status.
     * It provides a unified API for status transitions from controllers.
     *
     * @param Campaign $campaign The campaign to update
     * @param CampaignStatus $status Target status
     * @param int $reviewedBy User ID performing the action
     * @param int[]|null $creatorIds Creator IDs (for APPROVED status)
     * @param string|null $reasonForRefusal Refusal reason (for REFUSED status)
     * @return Campaign Freshly loaded campaign with relations
     *
     * @throws ValidationException If validation fails
     * @throws \InvalidArgumentException If status is not supported
     */
    public function updateStatus(
        Campaign $campaign,
        CampaignStatus $status,
        int $reviewedBy,
        ?array $creatorIds = null,
        ?string $reasonForRefusal = null,
    ): Campaign {
        // Delegate to specific Actions based on target status
        return match ($status) {
            CampaignStatus::APPROVED => $this->approve($campaign,  $reviewedBy),
            CampaignStatus::REFUSED => $this->refuse($campaign, $reasonForRefusal ?? '', $reviewedBy),
            CampaignStatus::SENT_TO_CREATORS => app(SendToCreatorsAction::class)($campaign, [
                'sent_by' => $reviewedBy,
                'creator_ids' => $creatorIds ?? [],
            ])->campaign,
            CampaignStatus::IN_PROGRESS => app(StartAction::class)($campaign, [
                'started_by' => $reviewedBy,
            ])->campaign,
            CampaignStatus::COMPLETED => app(CompleteAction::class)($campaign, [
                'completed_by' => $reviewedBy,
            ])->campaign,
            CampaignStatus::CANCELLED => app(CancelAction::class)($campaign, [
                'cancelled_by' => $reviewedBy,
                'reason' => $reasonForRefusal,
            ])->campaign,
            CampaignStatus::DRAFT => app(RevertToDraftAction::class)($campaign, [
                'user_id' => $reviewedBy,
                'reason' => 'Admin reverted campaign to draft',
            ])->campaign,
            default => throw new \InvalidArgumentException(sprintf(
                'Unsupported status transition: %s. Use specific Action classes for %s.',
                $status->value,
                $status->value
            )),
        };
    }

    /**
     * Process campaign checkout (payment).
     *
     * Delegates to CampaignCheckoutService.
     *
     * @param CampaignCheckoutRequest $request Validated checkout request
     * @param Campaign $campaign The campaign to checkout
     * @return mixed Checkout result
     */
    public function checkout(CampaignCheckoutRequest $request, Campaign $campaign)
    {
        $validated = $request->validated();

        return $this->checkoutService->processCheckout(
            campaign: $campaign,
            user: $request->user(),
            payload: $validated
        );
    }
}
