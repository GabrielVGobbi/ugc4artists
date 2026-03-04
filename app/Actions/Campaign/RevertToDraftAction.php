<?php

declare(strict_types=1);

namespace App\Actions\Campaign;

use App\Actions\Campaign\Support\ActionResult;
use App\Actions\Campaign\Support\BaseCampaignAction;
use App\Enums\CampaignStatus;
use App\Models\Campaign;
use Illuminate\Validation\ValidationException;

/**
 * Revert campaign to draft status.
 *
 * Business Rules:
 * - Campaign must be in REFUSED, CANCELLED, or AWAITING_PAYMENT status
 * - Status transition must be valid per enum rules
 *
 * Use Cases:
 * - User wants to fix issues after refusal
 * - User reopens cancelled campaign
 * - Payment failed and campaign needs to be edited
 *
 * Side Effects:
 * - Updates campaign status to DRAFT
 * - Clears rejection data (rejected_at, rejection_reason)
 * - Clears cancellation data (cancelled_at)
 * - Clears payment data (submitted_at, reviewed_at, publication_paid_at)
 * - Does NOT dispatch event (simple state revert)
 * - Logs action in application log
 *
 * This action allows users to fix issues and resubmit campaigns.
 *
 * Usage:
 * ```php
 * // User wants to edit refused campaign
 * $result = app(RevertToDraftAction::class)($campaign, [
 *     'user_id' => auth()->id(),
 *     'reason' => 'User requested to fix issues and resubmit',
 * ]);
 *
 * // Payment failed, revert to draft
 * $result = app(RevertToDraftAction::class)($campaign, [
 *     'user_id' => auth()->id(),
 *     'reason' => 'Payment failed, user needs to try again',
 * ]);
 * ```
 *
 * @throws ValidationException If business rules fail
 * @throws \InvalidArgumentException If transition is invalid
 */
class RevertToDraftAction extends BaseCampaignAction
{
    /**
     * Execute the revert to draft action.
     *
     * @param Campaign $campaign The campaign to revert
     * @param array<string, mixed> $data Must contain: user_id (int), optional: reason (string)
     * @return ActionResult Result with reverted campaign
     *
     * @throws ValidationException If validation fails
     */
    protected function execute(Campaign $campaign, array $data): ActionResult
    {
        // Validate business rules
        $this->validateBusinessRules($campaign, $data);

        $userId = $data['user_id'];
        $reason = $data['reason'] ?? 'Campaign reverted to draft';
        $targetStatus = CampaignStatus::DRAFT;

        // Validate transition
        if (!$campaign->status->canTransitionTo($targetStatus)) {
            throw ValidationException::withMessages([
                'status' => sprintf(
                    'Cannot revert campaign to draft from status "%s". Only refused, cancelled, or awaiting payment campaigns can be reverted.',
                    $campaign->status->getLabelText()
                ),
            ]);
        }

        // Store previous status for metadata
        $previousStatus = $campaign->status;

        // Clear timestamps based on previous status
        $clearFields = [
            'rejected_at' => null,
            'rejection_reason' => null,
            'cancelled_at' => null,
            'submitted_at' => null,
            'reviewed_at' => null,
        ];

        // Only clear payment data if coming from AWAITING_PAYMENT
        if ($campaign->status === CampaignStatus::AWAITING_PAYMENT) {
            $clearFields['publication_paid_at'] = null;
            $clearFields['publication_payment_method'] = null;
            $clearFields['publication_payment_id'] = null;
        }

        // Transition status and clear data
        $campaign->transitionTo($targetStatus, $clearFields);

        // No event dispatch for simple revert action

        return $this->success(
            campaign: $campaign,
            message: 'Campaign reverted to draft successfully.',
            metadata: [
                'user_id' => $userId,
                'reason' => $reason,
                'previous_status' => $previousStatus->value,
                'cleared_fields' => array_keys(array_filter($clearFields, fn($v) => $v === null)),
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

        // Only allow from specific statuses
        $allowedStatuses = [
            CampaignStatus::REFUSED,
            CampaignStatus::CANCELLED,
            CampaignStatus::AWAITING_PAYMENT,
        ];

        if (!in_array($campaign->status, $allowedStatuses, true)) {
            $errors['status'] = sprintf(
                'Cannot revert campaign to draft from status "%s". Only refused, cancelled, or awaiting payment campaigns can be reverted.',
                $campaign->status->getLabelText()
            );
        }

        // Validate user_id
        if (!isset($data['user_id'])) {
            $errors['user_id'] = 'User ID is required.';
        } elseif (!is_int($data['user_id']) || $data['user_id'] <= 0) {
            $errors['user_id'] = 'User ID must be a valid positive integer.';
        }

        if (!empty($errors)) {
            throw ValidationException::withMessages($errors);
        }
    }
}
