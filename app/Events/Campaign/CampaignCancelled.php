<?php

declare(strict_types=1);

namespace App\Events\Campaign;

use App\Models\Campaign;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Event dispatched when a campaign is cancelled.
 *
 * This event is fired after:
 * - Campaign is cancelled from any status (except COMPLETED)
 * - Campaign transitions to CANCELLED status
 *
 * Cancellation can occur at any stage:
 * - By campaign owner (before start or during progress)
 * - By admin (moderation, policy violation)
 * - By system (payment failure, timeout)
 *
 * Listeners can use this event to:
 * - Process refunds if applicable
 * - Notify all involved parties (owner, creators, admin)
 * - Log audit trail with cancellation reason
 * - Update analytics/metrics
 * - Clean up scheduled jobs/reminders
 *
 * Example:
 * ```php
 * Event::listen(CampaignCancelled::class, function (CampaignCancelled $event) {
 *     // Notify campaign owner
 *     Notification::send($event->campaign->user, new CampaignCancelledNotification($event));
 *
 *     // Notify creators if campaign was in progress
 *     if ($event->campaign->approvedCreators->isNotEmpty()) {
 *         Notification::send($event->campaign->approvedCreators, new CampaignCancelledNotification($event));
 *     }
 *
 *     // Process refund if needed
 *     if ($event->campaign->publication_paid_at) {
 *         RefundService::processRefund($event->campaign);
 *     }
 * });
 * ```
 */
class CampaignCancelled
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    /**
     * Create a new event instance.
     *
     * @param Campaign $campaign The cancelled campaign
     * @param int $cancelledBy User ID who cancelled the campaign (owner, admin, or system)
     * @param string|null $reason Cancellation reason (optional)
     */
    public function __construct(
        public Campaign $campaign,
        public int $cancelledBy,
        public ?string $reason = null,
    ) {}

    /**
     * Check if cancellation reason was provided.
     */
    public function hasReason(): bool
    {
        return !empty($this->reason);
    }
}
