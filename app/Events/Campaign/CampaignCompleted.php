<?php

declare(strict_types=1);

namespace App\Events\Campaign;

use App\Models\Campaign;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Event dispatched when a campaign is completed.
 *
 * This event is fired after:
 * - Campaign is in progress (IN_PROGRESS status)
 * - All deliverables are submitted and approved
 * - Campaign transitions to COMPLETED status
 *
 * Listeners can use this event to:
 * - Process final payments to creators
 * - Send completion notification to campaign owner
 * - Request review/rating
 * - Log audit trail
 * - Update analytics/metrics
 * - Archive campaign data
 *
 * Example:
 * ```php
 * Event::listen(CampaignCompleted::class, function (CampaignCompleted $event) {
 *     Notification::send($event->campaign->user, new CampaignCompletedNotification($event));
 *     // Process creator payments
 *     // Request campaign review
 * });
 * ```
 */
class CampaignCompleted
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    /**
     * Create a new event instance.
     *
     * @param Campaign $campaign The completed campaign
     * @param int $completedBy User ID who marked campaign as completed (admin or system)
     */
    public function __construct(
        public Campaign $campaign,
        public int $completedBy,
    ) {}
}
