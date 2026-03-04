<?php

declare(strict_types=1);

namespace App\Events\Campaign;

use App\Models\Campaign;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Event dispatched when a campaign is sent to creators.
 *
 * This event is fired after:
 * - Campaign is approved (APPROVED status)
 * - Admin manually sends campaign to creators
 * - Campaign transitions to SENT_TO_CREATORS status
 *
 * Listeners can use this event to:
 * - Send notification to selected creators
 * - Notify campaign owner that campaign is live
 * - Log audit trail
 * - Update analytics/metrics
 *
 * Example:
 * ```php
 * Event::listen(CampaignSentToCreators::class, function (CampaignSentToCreators $event) {
 *     foreach ($event->campaign->approvedCreators as $creator) {
 *         Notification::send($creator, new NewCampaignAvailableNotification($event->campaign));
 *     }
 * });
 * ```
 */
class CampaignSentToCreators
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    /**
     * Create a new event instance.
     *
     * @param Campaign $campaign The campaign sent to creators
     * @param int $sentBy Admin user ID who sent the campaign
     */
    public function __construct(
        public Campaign $campaign,
        public int $sentBy,
    ) {}
}
