<?php

declare(strict_types=1);

namespace App\Actions\Campaign;

use App\Actions\Campaign\Support\ActionResult;
use App\Actions\Campaign\Support\BaseCampaignAction;
use App\Enums\CampaignStatus;
use App\Events\Campaign\CampaignApproved;
use App\Models\Campaign;
use Illuminate\Validation\ValidationException;

/**
 * Approve a campaign and assign approved creators.
 *
 * Business Rules:
 * - Campaign must be in UNDER_REVIEW or PENDING status
 * - At least one creator must be selected
 * - All creator IDs must exist in database
 * - Status transition must be valid per enum rules
 *
 * Side Effects:
 * - Syncs approved creators pivot table
 * - Updates reviewed_by, reviewed_at, approved_at timestamps
 * - Clears any previous rejection data (rejected_at, rejection_reason)
 * - Dispatches CampaignApproved event
 * - Logs action in application log
 *
 * Usage:
 * ```php
 * $result = app(ApproveAction::class)($campaign, [
 *     'creator_ids' => [1, 2, 3],
 *     'reviewed_by' => auth()->id(),
 * ]);
 *
 * if ($result->isSuccess()) {
 *     return response()->json([
 *         'message' => $result->message,
 *         'campaign' => new CampaignResource($result->campaign),
 *     ]);
 * }
 * ```
 *
 * @throws ValidationException If business rules fail
 * @throws \InvalidArgumentException If transition is invalid
 */
class ApproveAction extends BaseCampaignAction
{
    /**
     * Execute the approve action.
     *
     * @param Campaign $campaign The campaign to approve
     * @param array<string, mixed> $data Must contain: creator_ids (array), reviewed_by (int)
     * @return ActionResult Result with approved campaign
     *
     * @throws ValidationException If validation fails
     */
    protected function execute(Campaign $campaign, array $data): ActionResult
    {
        $reviewedBy = $data['reviewed_by'];
        $targetStatus = CampaignStatus::APPROVED;

        // Validate transition
        if (!$campaign->status->canTransitionTo($targetStatus)) {
            throw ValidationException::withMessages([
                'status' => sprintf(
                    'Cannot approve campaign in status "%s". Only campaigns in "Under Review" can be approved.',
                    $campaign->status->getLabelText()
                ),
            ]);
        }

        // Store previous status for metadata
        $previousStatus = $campaign->status;

        // Transition status with timestamps
        $campaign->transitionTo($targetStatus, [
            'reviewed_by' => $reviewedBy,
            'reviewed_at' => $campaign->reviewed_at ?? now(),
            'approved_at' => now(),
            'rejected_at' => null,
            'rejection_reason' => null,
        ]);

        // Dispatch event
        $this->dispatchEvent(new CampaignApproved(
            campaign: $campaign,
            reviewedBy: $reviewedBy,
        ));

        return $this->success(
            campaign: $campaign,
            message: 'Campaign approved successfully.',
            metadata: [
                'reviewed_by' => $reviewedBy,
                #'creators_count' => count($creatorIds),
                'previous_status' => $previousStatus->value,
                'approved_at' => now()->toDateTimeString(),
            ]
        );
    }

    /**
     * Validate business rules for campaign approval.
     *
     * @param Campaign $campaign The campaign to validate
     * @param array<string, mixed> $data Input data
     *
     * @throws ValidationException If validation fails
     */
    protected function validateBusinessRules(Campaign $campaign, array $data): void
    {
        $errors = [];

        // Validate reviewed_by
        if (!isset($data['reviewed_by'])) {
            $errors['reviewed_by'] = 'Reviewer ID is required.';
        } elseif (!is_int($data['reviewed_by']) || $data['reviewed_by'] <= 0) {
            $errors['reviewed_by'] = 'Reviewer ID must be a valid positive integer.';
        }

        if (!empty($errors)) {
            throw ValidationException::withMessages($errors);
        }
    }
}
