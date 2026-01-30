<?php

declare(strict_types=1);

namespace App\Modules\Payments\Core\Contracts;

use App\Modules\Payments\Core\DTOs\Subscription\SubscriptionCollection;
use App\Modules\Payments\Core\DTOs\Subscription\SubscriptionRequest;
use App\Modules\Payments\Core\DTOs\Subscription\SubscriptionResponse;

/**
 * Interface for subscription/recurring payment services.
 */
interface SubscriptionServiceInterface
{
    /**
     * Create a new subscription.
     */
    public function create(SubscriptionRequest $request): SubscriptionResponse;

    /**
     * Find a subscription by ID.
     */
    public function find(string $id): ?SubscriptionResponse;

    /**
     * Find a subscription by external reference.
     */
    public function findByExternalReference(string $externalReference): ?SubscriptionResponse;

    /**
     * Update an existing subscription.
     */
    public function update(string $id, SubscriptionRequest $request): SubscriptionResponse;

    /**
     * Cancel a subscription.
     */
    public function cancel(string $id): bool;

    /**
     * Pause a subscription.
     */
    public function pause(string $id): SubscriptionResponse;

    /**
     * Resume a paused subscription.
     */
    public function resume(string $id): SubscriptionResponse;

    /**
     * List subscriptions with optional filters.
     *
     * @param array<string, mixed> $filters
     */
    public function list(array $filters = []): SubscriptionCollection;

    /**
     * List subscriptions for a specific customer.
     *
     * @param array<string, mixed> $filters
     */
    public function listByCustomer(string $customerId, array $filters = []): SubscriptionCollection;

    /**
     * Get payments/invoices for a subscription.
     *
     * @return array<mixed>
     */
    public function getPayments(string $subscriptionId): array;
}
