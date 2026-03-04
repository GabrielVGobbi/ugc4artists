<?php

declare(strict_types=1);

namespace App\Events\Campaign;

use App\Models\Campaign;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Event dispatched when a campaign is refused by an admin.
 *
 * This event is fired after:
 * - Admin reviews campaign (UNDER_REVIEW status)
 * - Decides to refuse/reject the campaign
 * - Campaign transitions to REFUSED status
 *
 * Listeners can use this event to:
 * - Send notification to campaign owner with refusal reason
 * - Log audit trail
 * - Update analytics/metrics
 * - Trigger refund process if applicable
 *
 * Example:
 * ```php
 * Event::listen(CampaignRefused::class, function (CampaignRefused $event) {
 *     Notification::send($event->campaign->user, new CampaignRefusedNotification($event));
 * });
 * ```
 */
class CampaignRefused
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    /**
     * Create a new event instance.
     *
     * @param Campaign $campaign The refused campaign
     * @param int $reviewedBy Admin user ID who refused the campaign
     * @param string $reason Reason for refusal (will be shown to campaign owner)
     */
    public function __construct(
        public Campaign $campaign,
        public int $reviewedBy,
        public string $reason,
    ) {}
}
