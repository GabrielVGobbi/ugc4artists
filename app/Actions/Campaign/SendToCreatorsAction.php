<?php

declare(strict_types=1);

namespace App\Actions\Campaign;

use App\Actions\Campaign\Support\ActionResult;
use App\Actions\Campaign\Support\BaseCampaignAction;
use App\Enums\CampaignStatus;
use App\Events\Campaign\CampaignSentToCreators;
use App\Models\Campaign;
use Illuminate\Validation\ValidationException;

/**
 * Send approved campaign to creators.
 *
 * Business Rules:
 * - Campaign must be in APPROVED status
 * - Must select at least 1 creator
 * - Cannot exceed campaign's slots_to_approve limit
 * - Status transition must be valid per enum rules
 *
 * Side Effects:
 * - Updates campaign status to SENT_TO_CREATORS
 * - Sets publication_paid_at if not already set
 * - Dispatches CampaignSentToCreators event
 * - Logs action in application log
 *
 * Creators will receive notifications and can accept the campaign.
 * When a creator accepts, campaign automatically transitions to IN_PROGRESS.
 *
 * Usage:
 * ```php
 * $result = app(SendToCreatorsAction::class)($campaign, [
 *     'sent_by' => auth()->id(),
 *     'creator_ids' => [1, 2, 3],
 * ]);
 * ```
 *
 * @throws ValidationException If business rules fail
 * @throws \InvalidArgumentException If transition is invalid
 */
class SendToCreatorsAction extends BaseCampaignAction
{
    /**
     * Execute the send to creators action.
     *
     * @param Campaign $campaign The campaign to send
     * @param array<string, mixed> $data Must contain: sent_by (int), creator_ids (array)
     * @return ActionResult Result with updated campaign
     *
     * @throws ValidationException If validation fails
     */
    protected function execute(Campaign $campaign, array $data): ActionResult
    {
        // Validate business rules
        $this->validateBusinessRules($campaign, $data);

        $sentBy = $data['sent_by'];
        $creatorIds = $data['creator_ids'];
        $targetStatus = CampaignStatus::SENT_TO_CREATORS;

        // Validate transition
        if (!$campaign->status->canTransitionTo($targetStatus)) {
            throw ValidationException::withMessages([
                'status' => sprintf(
                    'Cannot send campaign to creators in status "%s". Only approved campaigns can be sent.',
                    $campaign->status->getLabelText()
                ),
            ]);
        }

        // Store previous status for metadata
        $previousStatus = $campaign->status;

        // Sync approved creators
        $campaign->approvedCreators()->sync($creatorIds);
        $campaign->loadCount('approvedCreators');

        // Transition status
        $campaign->transitionTo($targetStatus, [
            'publication_paid_at' => $campaign->publication_paid_at ?? now(),
        ]);

        // Dispatch event
        $this->dispatchEvent(new CampaignSentToCreators(
            campaign: $campaign,
            sentBy: $sentBy,
        ));

        return $this->success(
            campaign: $campaign,
            message: 'Campaign sent to creators successfully.',
            metadata: [
                'sent_by' => $sentBy,
                'creators_count' => $campaign->approved_creators_count,
                'previous_status' => $previousStatus->value,
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

        // Validate creator_ids
        if (!isset($data['creator_ids'])) {
            $errors['creator_ids'] = 'Creator IDs are required.';
        } elseif (!is_array($data['creator_ids'])) {
            $errors['creator_ids'] = 'Creator IDs must be an array.';
        } elseif (empty($data['creator_ids'])) {
            $errors['creator_ids'] = 'Select at least one creator to send the campaign.';
        } elseif (count($data['creator_ids']) > $campaign->slots_to_approve) {
            $errors['creator_ids'] = sprintf(
                'You can only select up to %d creator%s for this campaign. Currently selected: %d.',
                $campaign->slots_to_approve,
                $campaign->slots_to_approve > 1 ? 's' : '',
                count($data['creator_ids'])
            );
        }

        // Validate sent_by
        if (!isset($data['sent_by'])) {
            $errors['sent_by'] = 'Sender ID is required.';
        } elseif (!is_int($data['sent_by']) || $data['sent_by'] <= 0) {
            $errors['sent_by'] = 'Sender ID must be a valid positive integer.';
        }

        if (!empty($errors)) {
            throw ValidationException::withMessages($errors);
        }
    }
}
