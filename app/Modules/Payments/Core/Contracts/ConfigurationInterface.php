<?php

declare(strict_types=1);

namespace App\Modules\Payments\Core\Contracts;

/**
 * Interface for gateway configuration.
 */
interface ConfigurationInterface
{
    /**
     * Get the gateway identifier.
     */
    public function getName(): string;

    /**
     * Get the API key/token.
     */
    public function getApiKey(): ?string;

    /**
     * Get the base URL for API requests.
     */
    public function getBaseUrl(): string;

    /**
     * Check if sandbox/test mode is enabled.
     */
    public function isSandbox(): bool;

    /**
     * Get the webhook secret/token.
     */
    public function getWebhookSecret(): ?string;

    /**
     * Get the request timeout in seconds.
     */
    public function getTimeout(): int;

    /**
     * Get retry configuration.
     *
     * @return array{attempts: int, delay: int}
     */
    public function getRetryConfig(): array;

    /**
     * Get all configuration as array.
     *
     * @return array<string, mixed>
     */
    public function toArray(): array;

    /**
     * Check if a feature is enabled.
     */
    public function isFeatureEnabled(string $feature): bool;

    /**
     * Get all enabled features.
     *
     * @return array<string, bool>
     */
    public function getFeatures(): array;
}
