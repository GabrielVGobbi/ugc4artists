<?php

declare(strict_types=1);

namespace App\Modules\Payments\Webhooks;

use App\Modules\Payments\Core\Contracts\WebhookHandlerInterface;
use App\Modules\Payments\Events\WebhookReceived;
use App\Modules\Payments\Models\WebhookEvent as WebhookEventModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use InvalidArgumentException;

/**
 * Dispatcher for webhook events from payment gateways.
 *
 * Handles routing to the appropriate gateway handler and
 * processes webhooks synchronously.
 */
final class WebhookDispatcher
{
    /**
     * @var array<string, WebhookHandlerInterface>
     */
    private array $handlers = [];

    /**
     * Register a webhook handler for a gateway.
     */
    public function registerHandler(string $gateway, WebhookHandlerInterface $handler): self
    {
        $this->handlers[strtolower($gateway)] = $handler;
        $this->log('debug', "Registered webhook handler for gateway: {$gateway}");

        return $this;
    }

    /**
     * Check if a handler is registered for a gateway.
     */
    public function hasHandler(string $gateway): bool
    {
        return isset($this->handlers[strtolower($gateway)]);
    }

    /**
     * Get the handler for a gateway.
     *
     * @throws InvalidArgumentException
     */
    public function getHandler(string $gateway): WebhookHandlerInterface
    {
        $gateway = strtolower($gateway);

        if (! $this->hasHandler($gateway)) {
            throw new InvalidArgumentException(
                "No webhook handler registered for gateway [{$gateway}]. " .
                "Available handlers: " . implode(', ', array_keys($this->handlers))
            );
        }

        return $this->handlers[$gateway];
    }

    /**
     * Dispatch a webhook from an HTTP request.
     *
     * This is the main entry point for processing webhooks.
     * Processes synchronously without using jobs.
     */
    public function dispatch(string $gateway, Request $request): WebhookEventModel
    {
        $handler = $this->getHandler($gateway);

        $this->log('info', 'Webhook received', [
            'gateway' => $gateway,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        // Use the handler's process method which handles everything
        if (method_exists($handler, 'process')) {
            $webhookEvent = $handler->process($request);
        } else {
            // Fallback for handlers that don't have process method
            $webhookEvent = $this->processLegacy($handler, $request);
        }

        // Dispatch Laravel event for listeners
        event(new WebhookReceived(
            webhookEvent: $webhookEvent,
            provider: $gateway,
            eventType: $webhookEvent->event_type,
        ));

        return $webhookEvent;
    }

    /**
     * Legacy processing for handlers without process method.
     */
    private function processLegacy(
        WebhookHandlerInterface $handler,
        Request $request,
    ): WebhookEventModel {
        $payload = $request->all();
        $headers = $this->normalizeHeaders($request->headers->all());

        // Verify
        $handler->verify($payload, $headers);

        // Parse
        $event = $handler->parse($payload, $headers);

        // Persist
        $webhookModel = WebhookEventModel::firstOrCreate(
            [
                'provider' => $handler->gateway(),
                'provider_event_id' => $event->providerEventId,
            ],
            [
                'payment_uuid' => $event->paymentUuid,
                'event_type' => $event->providerEventType,
                'payload' => $payload,
                'headers' => $headers,
            ]
        );

        // Skip if already processed
        if ($webhookModel->processed_at !== null) {
            return $webhookModel;
        }

        // Handle
        $handler->handle($event);

        // Mark as processed
        $webhookModel->update([
            'processed_at' => now(),
            'payment_uuid' => $event->paymentUuid ?? $webhookModel->payment_uuid,
        ]);

        return $webhookModel->fresh();
    }

    /**
     * Normalize headers to consistent format.
     */
    private function normalizeHeaders(array $headers): array
    {
        $normalized = [];
        foreach ($headers as $key => $value) {
            $normalized[strtolower($key)] = is_array($value) ? ($value[0] ?? null) : $value;
        }

        return $normalized;
    }

    /**
     * Get all registered handlers.
     *
     * @return array<string, WebhookHandlerInterface>
     */
    public function getHandlers(): array
    {
        return $this->handlers;
    }

    /**
     * Get list of registered gateway names.
     *
     * @return array<string>
     */
    public function getRegisteredGateways(): array
    {
        return array_keys($this->handlers);
    }

    /**
     * Log webhook activity.
     */
    private function log(string $level, string $message, array $context = []): void
    {
        Log::channel(config('payments.logging.channel', 'stack'))
            ->{$level}("[WebhookDispatcher] {$message}", $context);
    }
}
