<?php

declare(strict_types=1);

namespace App\Actions\Campaign;

use App\Actions\Campaign\Support\ActionResult;
use App\Actions\Campaign\Support\BaseCampaignAction;
use App\Enums\CampaignStatus;
use App\Events\Campaign\CampaignStarted;
use App\Models\Campaign;
use Illuminate\Validation\ValidationException;

/**
 * Start a campaign (transition to IN_PROGRESS).
 *
 * Triggered when:
 * - Creator accepts campaign (SENT_TO_CREATORS → IN_PROGRESS) - Automatic
 * - Admin manually starts campaign (APPROVED → IN_PROGRESS) - Manual
 *
 * Business Rules:
 * - Campaign must be in APPROVED or SENT_TO_CREATORS status
 * - Must have approved creators (count > 0)
 * - If from SENT_TO_CREATORS (creator acceptance), curator_id is required
 * - Status transition must be valid per enum rules
 *
 * Side Effects:
 * - Updates campaign status to IN_PROGRESS
 * - Sets started_at timestamp
 * - Records curator_id if provided (creator acceptance)
 * - Dispatches CampaignStarted event
 * - Logs action in application log
 *
 * Usage:
 * ```php
 * // Admin manually starts campaign
 * $result = app(StartAction::class)($campaign, [
 *     'started_by' => auth()->id(),
 * ]);
 *
 * // Creator accepts campaign (automatic)
 * $result = app(StartAction::class)($campaign, [
 *     'started_by' => auth()->id(),
 *     'curator_id' => auth()->id(),
 * ]);
 * ```
 *
 * @throws ValidationException If business rules fail
 * @throws \InvalidArgumentException If transition is invalid
 */
class StartAction extends BaseCampaignAction
{
    /**
     * Execute the start action.
     *
     * @param Campaign $campaign The campaign to start
     * @param array<string, mixed> $data Must contain: started_by (int), optional: curator_id (int)
     * @return ActionResult Result with started campaign
     *
     * @throws ValidationException If validation fails
     */
    protected function execute(Campaign $campaign, array $data): ActionResult
    {
        // Validate business rules
        $this->validateBusinessRules($campaign, $data);

        $startedBy = $data['started_by'];
        $curatorId = $data['curator_id'] ?? null;
        $targetStatus = CampaignStatus::IN_PROGRESS;

        // Validate transition
        if (!$campaign->status->canTransitionTo($targetStatus)) {
            throw ValidationException::withMessages([
                'status' => sprintf(
                    'Cannot start campaign in status "%s".',
                    $campaign->status->getLabelText()
                ),
            ]);
        }

        // Store previous status for metadata
        $previousStatus = $campaign->status;

        // Transition status
        $campaign->transitionTo($targetStatus, [
            'started_at' => now(),
        ]);

        // Dispatch event
        $this->dispatchEvent(new CampaignStarted(
            campaign: $campaign,
            startedBy: $startedBy,
            curatorId: $curatorId,
        ));

        $message = $curatorId
            ? 'Campaign started successfully. Creator has accepted the campaign.'
            : 'Campaign started successfully by admin.';

        return $this->success(
            campaign: $campaign,
            message: $message,
            metadata: [
                'started_by' => $startedBy,
                'curator_id' => $curatorId,
                'previous_status' => $previousStatus->value,
                'started_at' => now()->toDateTimeString(),
                'acceptance_type' => $curatorId ? 'creator_acceptance' : 'manual_start',
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

        // Must have approved creators
        if ($campaign->approved_creators_count <= 0) {
            $errors['status'] = 'Cannot start a campaign without approved creators.';
        }

        // Validate started_by
        if (!isset($data['started_by'])) {
            $errors['started_by'] = 'Starter ID is required.';
        } elseif (!is_int($data['started_by']) || $data['started_by'] <= 0) {
            $errors['started_by'] = 'Starter ID must be a valid positive integer.';
        }

        // If from SENT_TO_CREATORS (curator acceptance flow), require curator_id
        if ($campaign->status === CampaignStatus::SENT_TO_CREATORS) {
            if (!isset($data['curator_id'])) {
                $errors['curator_id'] = 'Creator ID is required when accepting campaign from SENT_TO_CREATORS status.';
            } elseif (!is_int($data['curator_id']) || $data['curator_id'] <= 0) {
                $errors['curator_id'] = 'Creator ID must be a valid positive integer.';
            }
        }

        if (!empty($errors)) {
            throw ValidationException::withMessages($errors);
        }
    }
}
