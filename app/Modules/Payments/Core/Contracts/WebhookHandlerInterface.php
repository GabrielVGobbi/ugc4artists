<?php

declare(strict_types=1);

namespace App\Modules\Payments\Core\Contracts;

use App\Modules\Payments\Core\DTOs\Webhook\WebhookEvent;

/**
 * Interface for gateway-specific webhook handlers.
 */
interface WebhookHandlerInterface
{
    /**
     * Get the gateway name this handler is for.
     */
    public function gateway(): string;

    /**
     * Verify the webhook signature/authenticity.
     *
     * @param array<string, mixed> $payload
     * @param array<string, string> $headers
     */
    public function verify(array $payload, array $headers): bool;

    /**
     * Parse the webhook payload into a standardized event.
     *
     * @param array<string, mixed> $payload
     * @param array<string, string> $headers
     */
    public function parse(array $payload, array $headers): WebhookEvent;

    /**
     * Handle the webhook event.
     */
    public function handle(WebhookEvent $event): void;

    /**
     * Get the list of supported event types.
     *
     * @return string[]
     */
    public function getSupportedEvents(): array;
}
