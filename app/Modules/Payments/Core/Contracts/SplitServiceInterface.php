<?php

declare(strict_types=1);

namespace App\Modules\Payments\Core\Contracts;

use App\Modules\Payments\Core\DTOs\Split\SplitCollection;
use App\Modules\Payments\Core\DTOs\Split\SplitRequest;
use App\Modules\Payments\Core\DTOs\Split\SplitResponse;
use App\Modules\Payments\Core\DTOs\Split\SplitRuleRequest;

/**
 * Interface for payment split services (marketplace).
 */
interface SplitServiceInterface
{
    /**
     * Create a split configuration for a payment.
     */
    public function create(SplitRequest $request): SplitResponse;

    /**
     * Find a split by ID.
     */
    public function find(string $id): ?SplitResponse;

    /**
     * Update a split configuration.
     */
    public function update(string $id, SplitRequest $request): SplitResponse;

    /**
     * Delete a split configuration.
     */
    public function delete(string $id): bool;

    /**
     * List splits with optional filters.
     *
     * @param array<string, mixed> $filters
     */
    public function list(array $filters = []): SplitCollection;

    /**
     * Add a split rule to an existing payment.
     */
    public function addRule(string $paymentId, SplitRuleRequest $rule): SplitResponse;

    /**
     * Remove a split rule from a payment.
     */
    public function removeRule(string $paymentId, string $ruleId): bool;

    /**
     * Get splits for a specific payment.
     */
    public function getByPayment(string $paymentId): ?SplitResponse;

    /**
     * Check if splits are enabled for this account.
     */
    public function isEnabled(): bool;
}
