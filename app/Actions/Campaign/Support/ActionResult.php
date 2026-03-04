<?php

declare(strict_types=1);

namespace App\Actions\Campaign\Support;

use App\Models\Campaign;

/**
 * Result object for campaign actions.
 *
 * Provides structured response from actions with:
 * - Success/failure status
 * - Updated campaign model (freshly loaded from database)
 * - Human-readable message
 * - Events dispatched (for testing/debugging)
 * - Additional metadata (reviewedBy, reason, previous status, etc.)
 *
 * This value object follows the same pattern as CheckoutCalculation,
 * providing an immutable, type-safe way to return action results.
 *
 * Example:
 * ```php
 * $result = new ActionResult(
 *     success: true,
 *     campaign: $campaign->fresh(['user', 'approvedCreators']),
 *     message: 'Campaign approved successfully.',
 *     events: ['App\\Events\\Campaign\\CampaignApproved'],
 *     metadata: [
 *         'reviewed_by' => 123,
 *         'creators_count' => 3,
 *         'previous_status' => 'under_review',
 *     ]
 * );
 * ```
 */
readonly class ActionResult
{
    /**
     * Create a new action result.
     *
     * @param bool $success Whether the action succeeded
     * @param Campaign $campaign Updated campaign model (should be fresh from database)
     * @param string $message Human-readable message describing the result
     * @param array<int, string> $events List of event class names dispatched during action
     * @param array<string, mixed> $metadata Additional context (reviewedBy, reason, previous status, etc.)
     */
    public function __construct(
        public bool $success,
        public Campaign $campaign,
        public string $message,
        public array $events = [],
        public array $metadata = [],
    ) {}

    /**
     * Check if the action succeeded.
     */
    public function isSuccess(): bool
    {
        return $this->success;
    }

    /**
     * Check if the action failed.
     */
    public function isFailure(): bool
    {
        return !$this->success;
    }

    /**
     * Convert result to array for API responses.
     *
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'success' => $this->success,
            'message' => $this->message,
            'campaign' => $this->campaign,
            'metadata' => $this->metadata,
        ];
    }

    /**
     * Get the campaign from the result.
     *
     * Convenience method for service layer that just needs the campaign.
     */
    public function getCampaign(): Campaign
    {
        return $this->campaign;
    }
}
