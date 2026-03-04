<?php

declare(strict_types=1);

namespace App\Actions\Campaign;

use App\Actions\Campaign\Support\ActionResult;
use App\Actions\Campaign\Support\BaseCampaignAction;
use App\Enums\CampaignStatus;
use App\Events\Campaign\CampaignCompleted;
use App\Models\Campaign;
use Illuminate\Validation\ValidationException;

/**
 * Mark campaign as completed.
 *
 * Business Rules:
 * - Campaign must be in IN_PROGRESS status
 * - All deliverables should be submitted and approved (not enforced by this action)
 * - Status transition must be valid per enum rules
 *
 * Side Effects:
 * - Updates campaign status to COMPLETED
 * - Sets completed_at timestamp
 * - Dispatches CampaignCompleted event
 * - Logs action in application log
 *
 * This is a final state - campaigns cannot transition from COMPLETED to any other status.
 *
 * Usage:
 * ```php
 * $result = app(CompleteAction::class)($campaign, [
 *     'completed_by' => auth()->id(),
 * ]);
 *
 * // Trigger post-completion actions
 * if ($result->isSuccess()) {
 *     // Process final payments
 *     // Request review/rating
 *     // Archive campaign data
 * }
 * ```
 *
 * @throws ValidationException If business rules fail
 * @throws \InvalidArgumentException If transition is invalid
 */
class CompleteAction extends BaseCampaignAction
{
    /**
     * Execute the complete action.
     *
     * @param Campaign $campaign The campaign to complete
     * @param array<string, mixed> $data Must contain: completed_by (int)
     * @return ActionResult Result with completed campaign
     *
     * @throws ValidationException If validation fails
     */
    protected function execute(Campaign $campaign, array $data): ActionResult
    {
        // Validate business rules
        $this->validateBusinessRules($campaign, $data);

        $completedBy = $data['completed_by'];
        $targetStatus = CampaignStatus::COMPLETED;

        // Validate transition
        if (!$campaign->status->canTransitionTo($targetStatus)) {
            throw ValidationException::withMessages([
                'status' => sprintf(
                    'Cannot complete campaign in status "%s". Only campaigns in "In Progress" can be completed.',
                    $campaign->status->getLabelText()
                ),
            ]);
        }

        // Store previous status for metadata
        $previousStatus = $campaign->status;

        // Transition status
        $campaign->transitionTo($targetStatus, [
            'completed_at' => now(),
        ]);

        // Dispatch event
        $this->dispatchEvent(new CampaignCompleted(
            campaign: $campaign,
            completedBy: $completedBy,
        ));

        return $this->success(
            campaign: $campaign,
            message: 'Campaign completed successfully.',
            metadata: [
                'completed_by' => $completedBy,
                'previous_status' => $previousStatus->value,
                'completed_at' => now()->toDateTimeString(),
                'duration_days' => $campaign->started_at ? now()->diffInDays($campaign->started_at) : null,
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

        // Validate completed_by
        if (!isset($data['completed_by'])) {
            $errors['completed_by'] = 'Completer ID is required.';
        } elseif (!is_int($data['completed_by']) || $data['completed_by'] <= 0) {
            $errors['completed_by'] = 'Completer ID must be a valid positive integer.';
        }

        if (!empty($errors)) {
            throw ValidationException::withMessages($errors);
        }
    }
}
