<?php

declare(strict_types=1);

namespace App\Actions\Campaign;

use App\Actions\Campaign\Support\ActionResult;
use App\Actions\Campaign\Support\BaseCampaignAction;
use App\Enums\CampaignStatus;
use App\Events\Campaign\CampaignRefused;
use App\Models\Campaign;
use Illuminate\Validation\ValidationException;

/**
 * Refuse a campaign with a reason.
 *
 * Business Rules:
 * - Campaign must be in UNDER_REVIEW or PENDING status
 * - Refusal reason is mandatory and non-empty
 * - Reason must be at least 10 characters
 * - Status transition must be valid per enum rules
 *
 * Side Effects:
 * - Clears approved creators (syncs to empty array)
 * - Sets rejection_reason and rejected_at timestamps
 * - Updates reviewed_by, reviewed_at
 * - Clears any previous approval data (approved_at)
 * - Dispatches CampaignRefused event
 * - Logs action in application log
 *
 * Usage:
 * ```php
 * $result = app(RefuseAction::class)($campaign, [
 *     'reason' => 'Content does not meet community guidelines.',
 *     'reviewed_by' => auth()->id(),
 * ]);
 *
 * if ($result->isSuccess()) {
 *     // Notify campaign owner with refusal reason
 *     Notification::send($campaign->user, new CampaignRefusedNotification($result));
 * }
 * ```
 *
 * @throws ValidationException If business rules fail
 * @throws \InvalidArgumentException If transition is invalid
 */
class RefuseAction extends BaseCampaignAction
{
    /**
     * Minimum length for refusal reason.
     */
    private const MIN_REASON_LENGTH = 10;

    /**
     * Execute the refuse action.
     *
     * @param Campaign $campaign The campaign to refuse
     * @param array<string, mixed> $data Must contain: reason (string), reviewed_by (int)
     * @return ActionResult Result with refused campaign
     *
     * @throws ValidationException If validation fails
     */
    protected function execute(Campaign $campaign, array $data): ActionResult
    {
        // Validate business rules
        $this->validateBusinessRules($campaign, $data);

        $reason = trim($data['reason']);
        $reviewedBy = $data['reviewed_by'];
        $targetStatus = CampaignStatus::REFUSED;

        // Validate transition
        if (!$campaign->status->canTransitionTo($targetStatus)) {
            throw ValidationException::withMessages([
                'status' => sprintf(
                    'Cannot refuse campaign in status "%s". Only campaigns in "Under Review" can be refused.',
                    $campaign->status->getLabelText()
                ),
            ]);
        }

        // Store previous status for metadata
        $previousStatus = $campaign->status;

        // Clear approved creators
        $campaign->approvedCreators()->sync([]);

        // Transition status with rejection data
        $campaign->transitionTo($targetStatus, [
            'reviewed_by' => $reviewedBy,
            'reviewed_at' => $campaign->reviewed_at ?? now(),
            'approved_at' => null, // Clear previous approval
            'rejected_at' => now(),
            'rejection_reason' => $reason,
            'approved_creators_count' => 0,
        ]);

        // Dispatch event
        $this->dispatchEvent(new CampaignRefused(
            campaign: $campaign,
            reviewedBy: $reviewedBy,
            reason: $reason,
        ));

        return $this->success(
            campaign: $campaign,
            message: 'Campaign refused successfully.',
            metadata: [
                'reviewed_by' => $reviewedBy,
                'reason' => $reason,
                'previous_status' => $previousStatus->value,
                'rejected_at' => now()->toDateTimeString(),
            ]
        );
    }

    /**
     * Validate business rules for campaign refusal.
     *
     * @param Campaign $campaign The campaign to validate
     * @param array<string, mixed> $data Input data
     *
     * @throws ValidationException If validation fails
     */
    protected function validateBusinessRules(Campaign $campaign, array $data): void
    {
        $errors = [];

        // Validate reason
        if (!isset($data['reason'])) {
            $errors['reason'] = 'Refusal reason is required.';
        } else {
            $reason = trim((string) $data['reason']);

            if ($reason === '') {
                $errors['reason'] = 'Refusal reason cannot be empty.';
            } elseif (strlen($reason) < self::MIN_REASON_LENGTH) {
                $errors['reason'] = sprintf(
                    'Refusal reason must be at least %d characters. Provided: %d characters.',
                    self::MIN_REASON_LENGTH,
                    strlen($reason)
                );
            }
        }

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
