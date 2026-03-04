<?php

declare(strict_types=1);

namespace App\Events\Campaign;

use App\Models\Campaign;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Event dispatched when a campaign starts (creator accepts).
 *
 * This event is fired after:
 * - Campaign is sent to creators (SENT_TO_CREATORS status)
 * - A creator accepts the campaign
 * - Campaign transitions to IN_PROGRESS status (automatic)
 *
 * Alternatively, can be triggered when:
 * - Admin manually starts campaign from APPROVED status
 *
 * Listeners can use this event to:
 * - Notify campaign owner that work has begun
 * - Send confirmation to accepting creator
 * - Log audit trail
 * - Update analytics/metrics
 * - Start deadline tracking
 *
 * Example:
 * ```php
 * Event::listen(CampaignStarted::class, function (CampaignStarted $event) {
 *     if ($event->curatorId) {
 *         Notification::send($event->campaign->user, new CreatorAcceptedNotification($event));
 *     }
 * });
 * ```
 */
class CampaignStarted
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    /**
     * Create a new event instance.
     *
     * @param Campaign $campaign The started campaign
     * @param int $startedBy User ID who started the campaign (admin or creator)
     * @param int|null $curatorId Creator ID who accepted (null if manually started by admin)
     */
    public function __construct(
        public Campaign $campaign,
        public int $startedBy,
        public ?int $curatorId = null,
    ) {}

    /**
     * Check if campaign was started by creator acceptance.
     */
    public function wasAcceptedByCreator(): bool
    {
        return $this->curatorId !== null;
    }

    /**
     * Check if campaign was manually started by admin.
     */
    public function wasManuallyStarted(): bool
    {
        return $this->curatorId === null;
    }
}
