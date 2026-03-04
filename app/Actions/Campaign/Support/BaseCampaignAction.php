<?php

declare(strict_types=1);

namespace App\Actions\Campaign\Support;

use App\Actions\Campaign\Contracts\CampaignActionContract;
use App\Models\Campaign;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Log;

/**
 * Base class for campaign actions providing common utilities.
 *
 * Provides:
 * - Database transaction wrapper for data consistency
 * - Event dispatching with tracking
 * - Structured logging (start, success, failure)
 * - Helper methods for creating success results
 *
 * Concrete actions can extend this class to inherit transaction handling,
 * logging, and event dispatching, or implement CampaignActionContract directly
 * for full control.
 *
 * Usage:
 * ```php
 * class ApproveAction extends BaseCampaignAction
 * {
 *     protected function execute(Campaign $campaign, array $data): ActionResult
 *     {
 *         // Validate business rules
 *         $this->validateBusinessRules($campaign, $data);
 *
 *         // Perform status transition
 *         $campaign->transitionTo(CampaignStatus::APPROVED, [...]);
 *
 *         // Dispatch event
 *         $this->dispatchEvent(new CampaignApproved($campaign, ...));
 *
 *         // Return success result
 *         return $this->success($campaign, 'Campaign approved successfully.', [...]);
 *     }
 * }
 * ```
 */
abstract class BaseCampaignAction implements CampaignActionContract
{
    /**
     * Events dispatched during action execution (for tracking in result).
     *
     * @var array<int, string>
     */
    protected array $dispatchedEvents = [];

    /**
     * Execute the action within a database transaction.
     *
     * This method wraps the concrete execute() implementation in a transaction,
     * ensuring data consistency. It also handles logging at start, success, and failure.
     *
     * @param Campaign $campaign The campaign to act upon
     * @param array<string, mixed> $data Action-specific data
     * @return ActionResult Result object with success status and updated campaign
     *
     * @throws \Exception If action fails (will rollback transaction)
     */
    public function __invoke(Campaign $campaign, array $data = []): ActionResult
    {
        return DB::transaction(function () use ($campaign, $data) {
            $this->logActionStart($campaign, $data);

            try {
                $result = $this->execute($campaign, $data);

                $this->logActionSuccess($campaign, $result);

                return $result;
            } catch (\Exception $e) {
                $this->logActionFailure($campaign, $e);
                throw $e;
            }
        });
    }

    /**
     * Concrete action implementation.
     *
     * Subclasses must implement this method with their specific logic:
     * 1. Validate business rules
     * 2. Perform status transition
     * 3. Dispatch events
     * 4. Return success result
     *
     * @param Campaign $campaign The campaign to act upon
     * @param array<string, mixed> $data Action-specific data
     * @return ActionResult Result object with success status and updated campaign
     */
    abstract protected function execute(Campaign $campaign, array $data): ActionResult;

    /**
     * Dispatch event and track it for result metadata.
     *
     * @param object $event Event instance to dispatch
     */
    protected function dispatchEvent(object $event): void
    {
        Event::dispatch($event);
        $this->dispatchedEvents[] = get_class($event);
    }

    /**
     * Create success result.
     *
     * Convenience method for creating successful ActionResult objects.
     * Automatically reloads campaign from database with relations.
     *
     * @param Campaign $campaign The updated campaign
     * @param string $message Human-readable success message
     * @param array<string, mixed> $metadata Additional context
     * @return ActionResult Success result with fresh campaign data
     */
    protected function success(
        Campaign $campaign,
        string $message,
        array $metadata = []
    ): ActionResult {
        return new ActionResult(
            success: true,
            campaign: $campaign->fresh(['user', 'approvedCreators', 'reviewer']),
            message: $message,
            events: $this->dispatchedEvents,
            metadata: $metadata,
        );
    }

    /**
     * Log action start.
     *
     * Logs action class, campaign ID, current status, and input data.
     *
     * @param Campaign $campaign The campaign being acted upon
     * @param array<string, mixed> $data Action input data
     */
    protected function logActionStart(Campaign $campaign, array $data): void
    {
        Log::info(static::class . ' started', [
            'campaign_id' => $campaign->id,
            'campaign_uuid' => $campaign->uuid,
            'current_status' => $campaign->status->value,
            'data' => array_filter($data, fn($v) => !is_object($v)), // Avoid logging models
        ]);
    }

    /**
     * Log action success.
     *
     * Logs action class, campaign ID, new status, message, and events dispatched.
     *
     * @param Campaign $campaign The campaign before update
     * @param ActionResult $result The action result
     */
    protected function logActionSuccess(Campaign $campaign, ActionResult $result): void
    {
        Log::info(static::class . ' succeeded', [
            'campaign_id' => $campaign->id,
            'campaign_uuid' => $campaign->uuid,
            'previous_status' => $campaign->status->value,
            'new_status' => $result->campaign->status->value,
            'message' => $result->message,
            'events' => $result->events,
        ]);
    }

    /**
     * Log action failure.
     *
     * Logs action class, campaign ID, current status, error message, and trace.
     *
     * @param Campaign $campaign The campaign being acted upon
     * @param \Exception $e The exception that occurred
     */
    protected function logActionFailure(Campaign $campaign, \Exception $e): void
    {
        Log::error(static::class . ' failed', [
            'campaign_id' => $campaign->id,
            'campaign_uuid' => $campaign->uuid,
            'current_status' => $campaign->status->value,
            'error' => $e->getMessage(),
            'exception' => get_class($e),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
        ]);
    }
}
