<?php

declare(strict_types=1);

namespace App\Events\Campaign;

use App\Models\Campaign;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Event dispatched when a campaign is approved by an admin.
 *
 * This event is fired after:
 * - Admin reviews campaign (UNDER_REVIEW status)
 * - Selects creators to work on campaign
 * - Campaign transitions to APPROVED status
 *
 * Listeners can use this event to:
 * - Send notification to campaign owner
 * - Notify selected creators
 * - Log audit trail
 * - Update analytics/metrics
 *
 * Example:
 * ```php
 * Event::listen(CampaignApproved::class, function (CampaignApproved $event) {
 *     Notification::send($event->campaign->user, new CampaignApprovedNotification($event));
 * });
 * ```
 */
class CampaignApproved
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    /**
     * Create a new event instance.
     *
     * @param Campaign $campaign The approved campaign
     * @param int $reviewedBy Admin user ID who approved the campaign
     */
    public function __construct(
        public Campaign $campaign,
        public int $reviewedBy,
    ) {}
}
