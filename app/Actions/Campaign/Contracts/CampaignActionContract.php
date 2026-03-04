<?php

declare(strict_types=1);

namespace App\Actions\Campaign\Contracts;

use App\Actions\Campaign\Support\ActionResult;
use App\Models\Campaign;

/**
 * Contract for all campaign status transition actions.
 *
 * Actions are single-purpose, invokable classes that encapsulate:
 * - Business rule validation
 * - Status transition logic
 * - Side effect orchestration (events, notifications)
 * - Audit trail creation
 *
 * Each action should:
 * - Validate business rules before execution
 * - Use database transactions for data consistency
 * - Dispatch events for side effects (notifications, logging)
 * - Return ActionResult with success status and updated campaign
 * - Throw exceptions for validation failures (ValidationException, InvalidArgumentException)
 *
 * Example usage:
 * ```php
 * $result = app(ApproveAction::class)($campaign, [
 *     'creator_ids' => [1, 2, 3],
 *     'reviewed_by' => auth()->id(),
 * ]);
 *
 * if ($result->isSuccess()) {
 *     return response()->json([
 *         'message' => $result->message,
 *         'campaign' => new CampaignResource($result->campaign),
 *     ]);
 * }
 * ```
 */
interface CampaignActionContract
{
    /**
     * Execute the action.
     *
     * @param Campaign $campaign The campaign to act upon
     * @param array<string, mixed> $data Action-specific data (creator_ids, reviewed_by, reason, etc.)
     * @return ActionResult Result object with success status, updated campaign, and metadata
     *
     * @throws \Illuminate\Validation\ValidationException If business rules fail
     * @throws \InvalidArgumentException If transition is invalid
     */
    public function __invoke(Campaign $campaign, array $data = []): ActionResult;
}
