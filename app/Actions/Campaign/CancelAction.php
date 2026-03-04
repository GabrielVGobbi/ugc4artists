<?php

declare(strict_types=1);

namespace App\Actions\Campaign;

use App\Actions\Campaign\Support\ActionResult;
use App\Actions\Campaign\Support\BaseCampaignAction;
use App\Enums\CampaignStatus;
use App\Events\Campaign\CampaignCancelled;
use App\Models\Campaign;
use Illuminate\Validation\ValidationException;

/**
 * Cancel a campaign.
 *
 * Business Rules:
 * - Campaign can be cancelled from any status except COMPLETED
 * - Cancellation reason is optional but recommended
 * - Status transition must be valid per enum rules
 *
 * Cancellation can occur:
 * - By campaign owner (before start or during progress)
 * - By admin (moderation, policy violation)
 * - By system (payment failure, timeout)
 *
 * Side Effects:
 * - Updates campaign status to CANCELLED
 * - Sets cancelled_at timestamp
 * - Optionally sets cancellation reason
 * - Dispatches CampaignCancelled event
 * - Logs action in application log
 *
 * Cancelled campaigns can be reopened (CANCELLED → DRAFT) via RevertToDraftAction.
 *
 * Usage:
 * ```php
 * $result = app(CancelAction::class)($campaign, [
 *     'cancelled_by' => auth()->id(),
 *     'reason' => 'User requested cancellation',
 * ]);
 *
 * // Trigger post-cancellation actions
 * if ($result->isSuccess()) {
 *     // Process refunds if applicable
 *     // Notify involved parties
 *     // Clean up scheduled jobs
 * }
 * ```
 *
 * @throws ValidationException If business rules fail
 * @throws \InvalidArgumentException If transition is invalid
 */
class CancelAction extends BaseCampaignAction
{
    /**
     * Execute the cancel action.
     *
     * @param Campaign $campaign The campaign to cancel
     * @param array<string, mixed> $data Must contain: cancelled_by (int), optional: reason (string)
     * @return ActionResult Result with cancelled campaign
     *
     * @throws ValidationException If validation fails
     */
    protected function execute(Campaign $campaign, array $data): ActionResult
    {
        // Validate business rules
        $this->validateBusinessRules($campaign, $data);

        $cancelledBy = $data['cancelled_by'];
        $reason = isset($data['reason']) ? trim($data['reason']) : null;
        $targetStatus = CampaignStatus::CANCELLED;

        // Validate transition
        if (!$campaign->status->canTransitionTo($targetStatus)) {
            throw ValidationException::withMessages([
                'status' => sprintf(
                    'Cannot cancel campaign in status "%s". Completed campaigns cannot be cancelled.',
                    $campaign->status->getLabelText()
                ),
            ]);
        }

        // Store previous status for metadata
        $previousStatus = $campaign->status;

        // Transition status with cancellation data
        $extraFields = [
            'cancelled_at' => now(),
        ];

        // Only set reason if provided (don't clear existing rejection_reason)
        if ($reason !== null && $reason !== '') {
            $extraFields['rejection_reason'] = $reason;
        }

        $campaign->transitionTo($targetStatus, $extraFields);

        // Dispatch event
        $this->dispatchEvent(new CampaignCancelled(
            campaign: $campaign,
            cancelledBy: $cancelledBy,
            reason: $reason,
        ));

        return $this->success(
            campaign: $campaign,
            message: 'Campaign cancelled successfully.',
            metadata: [
                'cancelled_by' => $cancelledBy,
                'reason' => $reason,
                'previous_status' => $previousStatus->value,
                'cancelled_at' => now()->toDateTimeString(),
            ]
        );
    }

    /**
     * Validate business rules.
     *
     * @param Campaign $campaign The campaign to validate
     * @param array<string, mixed> $data Input data
     *
     * @throws ValidationException If validation fails
     */
    protected function validateBusinessRules(Campaign $campaign, array $data): void
    {
        $errors = [];

        // Cannot cancel completed campaigns
        if ($campaign->status === CampaignStatus::COMPLETED) {
            $errors['status'] = 'Cannot cancel a completed campaign.';
        }

        // Validate cancelled_by
        if (!isset($data['cancelled_by'])) {
            $errors['cancelled_by'] = 'Canceller ID is required.';
        } elseif (!is_int($data['cancelled_by']) || $data['cancelled_by'] <= 0) {
            $errors['cancelled_by'] = 'Canceller ID must be a valid positive integer.';
        }

        // Validate reason if provided
        if (isset($data['reason'])) {
            $reason = trim((string) $data['reason']);
            if (strlen($reason) > 2000) {
                $errors['reason'] = 'Cancellation reason must not exceed 2000 characters.';
            }
        }

        if (!empty($errors)) {
            throw ValidationException::withMessages($errors);
        }
    }
}
