<?php

declare(strict_types=1);

namespace App\Modules\Payments\Core\Contracts;

/**
 * Interface for gateway managers that provide access to domain services.
 */
interface GatewayManagerInterface
{
    /**
     * Get the gateway identifier name.
     */
    public function name(): string;

    /**
     * Get the customers service.
     */
    public function customers(): CustomerServiceInterface;

    /**
     * Get the payments service.
     */
    public function payments(): PaymentServiceInterface;

    /**
     * Get the subscriptions service.
     */
    public function subscriptions(): SubscriptionServiceInterface;

    /**
     * Get the transfers service.
     */
    public function transfers(): TransferServiceInterface;

    /**
     * Get the splits service.
     */
    public function splits(): SplitServiceInterface;

    /**
     * Check if the gateway is available/healthy.
     */
    public function isAvailable(): bool;

    /**
     * Check if a specific feature is supported.
     */
    public function supportsFeature(string $feature): bool;

    /**
     * Get all supported features.
     *
     * @return array<string, bool>
     */
    public function getSupportedFeatures(): array;
}
