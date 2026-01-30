<?php

declare(strict_types=1);

namespace App\Modules\Payments\Gateways\Asaas\Webhooks;

use App\Modules\Payments\Core\Contracts\WebhookHandlerInterface;
use App\Modules\Payments\Core\DTOs\Webhook\WebhookEvent;
use App\Modules\Payments\Enums\PaymentEventType;
use App\Modules\Payments\Exceptions\WebhookVerificationException;
use App\Modules\Payments\Models\Payment;
use App\Modules\Payments\Models\WebhookEvent as WebhookEventModel;
use App\Modules\Payments\Services\SettlementService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Webhook handler for Asaas gateway.
 *
 * Handles verification, parsing, and processing of Asaas webhook events.
 * Implements idempotency and proper error handling.
 */
final class AsaasWebhookHandler implements WebhookHandlerInterface
{
    private const GATEWAY_NAME = 'asaas';

    /**
     * Mapping of Asaas events to internal event types.
     */
    private const EVENT_MAPPING = [
        // Payment success events
        'PAYMENT_CONFIRMED' => PaymentEventType::PAYMENT_CONFIRMED,
        'PAYMENT_RECEIVED' => PaymentEventType::PAYMENT_RECEIVED,

        // Payment pending events
        'PAYMENT_CREATED' => PaymentEventType::PAYMENT_CREATED,
        'PAYMENT_UPDATED' => PaymentEventType::PAYMENT_PENDING,
        'PAYMENT_RESTORED' => PaymentEventType::PAYMENT_PENDING,

        // Payment failure events
        'PAYMENT_OVERDUE' => PaymentEventType::PAYMENT_EXPIRED,
        'PAYMENT_DELETED' => PaymentEventType::PAYMENT_CANCELED,

        // Refund events
        'PAYMENT_REFUNDED' => PaymentEventType::PAYMENT_REFUNDED,
        'PAYMENT_PARTIALLY_REFUNDED' => PaymentEventType::PAYMENT_PARTIALLY_REFUNDED,
        'PAYMENT_REFUND_IN_PROGRESS' => PaymentEventType::PAYMENT_PENDING,

        // Chargeback events
        'PAYMENT_CHARGEBACK_REQUESTED' => PaymentEventType::PAYMENT_CHARGEBACK,
        'PAYMENT_CHARGEBACK_DISPUTE' => PaymentEventType::PAYMENT_CHARGEBACK,
        'PAYMENT_AWAITING_CHARGEBACK_REVERSAL' => PaymentEventType::PAYMENT_CHARGEBACK,
    ];

    public function __construct(
        private SettlementService $settlement,
    ) {}

    public function gateway(): string
    {
        return self::GATEWAY_NAME;
    }

    /**
     * Verify webhook authenticity using access token.
     *
     * Asaas sends an access token in the header that should match
     * the configured webhook secret.
     */
    public function verify(array $payload, array $headers): bool
    {
        $configuredToken = config('payments.gateways.asaas.webhook_secret');

        if (app()->isLocal()) {
            return true;
        }

        // Warn if no token is configured
        if (empty($configuredToken)) {
            $this->log('warning', 'Webhook verification skipped - ASAAS_WEBHOOK_SECRET not configured', [
                'ip' => request()->ip(),
            ]);

            // In production, we should still require the token
            throw WebhookVerificationException::missingSignature(
                $this->gateway(),
            );

            return true;
        }

        // Extract token from headers (case-insensitive)
        $receivedToken = $this->extractAccessToken($headers);

        if (empty($receivedToken)) {
            $this->log('warning', 'Missing access token in webhook request', [
                'ip' => request()->ip(),
                'headers' => array_keys($headers),
            ]);

            throw WebhookVerificationException::missingSignature($this->gateway());
        }

        // Use timing-safe comparison
        if (! hash_equals($configuredToken, $receivedToken)) {
            $this->log('warning', 'Invalid webhook access token', [
                'ip' => request()->ip(),
            ]);

            throw WebhookVerificationException::invalidSignature($this->gateway());
        }

        return true;
    }

    /**
     * Parse Asaas webhook payload into standardized event.
     */
    public function parse(array $payload, array $headers): WebhookEvent
    {
        $eventType = $payload['event'] ?? 'UNKNOWN';
        $paymentData = $payload['payment'] ?? [];
        $transferData = $payload['transfer'] ?? [];

        // Determine the resource type and extract ID
        $resourceId = $paymentData['id'] ?? $transferData['id'] ?? null;
        $providerEventId = $payload['id']; #$resourceId ?? $this->generateEventId($payload);
        $providerPaymentId = $payload['payment']['id'] ?? null;

        return new WebhookEvent(
            provider: $this->gateway(),
            providerEventId: $providerEventId,
            providerPaymentId: $providerPaymentId,
            providerEventType: $eventType,
            eventType: $this->mapEventType($eventType),
            paymentUuid: $paymentData['externalReference'] ?? null,
            customerId: $paymentData['customer'] ?? null,
            subscriptionId: $paymentData['subscription'] ?? null,
            eventDate: $this->parseEventDate($paymentData),
            payload: $payload,
            headers: $headers,
        );
    }

    /**
     * Handle the webhook event synchronously.
     */
    public function handle(WebhookEvent $event): void
    {
        $providerEventType = strtoupper($event->providerEventType);

        // Handle different event categories
        if (str_starts_with($providerEventType, 'PAYMENT_')) {
            $this->handlePaymentEvent($event);
        } elseif (str_starts_with($providerEventType, 'TRANSFER_')) {
            $this->handleTransferEvent($event);
        } elseif (str_starts_with($providerEventType, 'SUBSCRIPTION_')) {
            $this->handleSubscriptionEvent($event);
        } else {
            $this->log('info', 'Unhandled event category', [
                'event_type' => $event->providerEventType,
            ]);
        }
    }

    /**
     * Process the full webhook lifecycle.
     *
     * This is the main entry point called by the controller.
     */
    public function process(Request $request): WebhookEventModel
    {
        $payload = $request->all();
        $headers = $this->normalizeHeaders($request->headers->all());

        // 1. Verify authenticity
        $this->verify($payload, $headers);

        // 2. Parse the event
        $event = $this->parse($payload, $headers);

        // 3. Check for idempotency and persist
        $webhookModel = $this->persistEvent($event);

        // 4. Skip if already processed (idempotency)
        if ($webhookModel->processed_at !== null) {
            return $webhookModel;
        }

        // 5. Handle the event within a transaction
        DB::transaction(function () use ($event, $webhookModel) {
            try {
                $this->handle($event);

                $webhookModel->update([
                    'processed_at' => now(),
                    'payment_uuid' => $event->paymentUuid ?? $webhookModel->payment_uuid,
                ]);
            } catch (\Throwable $e) {
                $webhookModel->update([
                    'error_message' => $e->getMessage(),
                    'attempts' => ($webhookModel->attempts ?? 0) + 1,
                ]);

                $this->log('error', 'Webhook processing failed', [
                    'webhook_id' => $webhookModel->id,
                    'event_type' => $event->providerEventType,
                    'error' => $e->getMessage(),
                ]);

                throw $e;
            }
        });

        return $webhookModel->fresh();
    }

    public function getSupportedEvents(): array
    {
        return [
            // Payment events
            'PAYMENT_CREATED',
            'PAYMENT_UPDATED',
            'PAYMENT_CONFIRMED',
            'PAYMENT_RECEIVED',
            'PAYMENT_OVERDUE',
            'PAYMENT_DELETED',
            'PAYMENT_RESTORED',
            'PAYMENT_REFUNDED',
            'PAYMENT_REFUND_IN_PROGRESS',
            'PAYMENT_PARTIALLY_REFUNDED',
            'PAYMENT_CHARGEBACK_REQUESTED',
            'PAYMENT_CHARGEBACK_DISPUTE',
            'PAYMENT_AWAITING_CHARGEBACK_REVERSAL',
            // Transfer events
            'TRANSFER_CREATED',
            'TRANSFER_PENDING',
            'TRANSFER_DONE',
            'TRANSFER_FAILED',
            'TRANSFER_CANCELLED',
            // Subscription events
            'SUBSCRIPTION_CREATED',
            'SUBSCRIPTION_UPDATED',
            'SUBSCRIPTION_INACTIVATED',
            'SUBSCRIPTION_DELETED',
        ];
    }

    /**
     * Handle payment-related events.
     */
    private function handlePaymentEvent(WebhookEvent $event): void
    {
        $payment = $this->findPayment($event);

        if (! $payment) {
            return;
        }

        $context = [
            'provider_event' => $event->payload,
            'provider_event_type' => $event->providerEventType,
            'webhook_received_at' => now()->toISOString(),
        ];

        match (true) {
            $event->eventType->isSuccessful() => $this->settlement->markPaid($payment, $context),
            $event->eventType === PaymentEventType::PAYMENT_CANCELED => $this->settlement->markFailed($payment, 'canceled', $context),
            $event->eventType->isFailed() => $this->settlement->markFailed($payment, 'failed', $context),
            $event->eventType->isRefund() => $this->handleRefund($payment, $event, $context),
            $event->eventType === PaymentEventType::PAYMENT_PENDING,
            $event->eventType === PaymentEventType::PAYMENT_CREATED => null, // No action needed
            default => $this->log('info', 'Unhandled payment event type', [
                'event_type' => $event->eventType->value,
                'payment_uuid' => $payment->uuid,
            ]),
        };
    }

    /**
     * Handle transfer-related events.
     */
    private function handleTransferEvent(WebhookEvent $event): void
    {
        $this->log('info', 'Transfer event received', [
            'event_type' => $event->providerEventType,
            'transfer_id' => $event->payload['transfer']['id'] ?? null,
        ]);

        // TODO: Implement transfer event handling when needed
    }

    /**
     * Handle subscription-related events.
     */
    private function handleSubscriptionEvent(WebhookEvent $event): void
    {
        $this->log('info', 'Subscription event received', [
            'event_type' => $event->providerEventType,
            'subscription_id' => $event->subscriptionId,
        ]);

        // TODO: Implement subscription event handling when needed
    }

    /**
     * Handle refund events.
     */
    private function handleRefund(Payment $payment, WebhookEvent $event, array $context): void
    {
        // For now, just log the refund
        $this->log('info', 'Refund event received', [
            'payment_uuid' => $payment->uuid,
            'event_type' => $event->providerEventType,
        ]);

        // TODO: Implement refund handling
    }

    /**
     * Find payment by UUID or gateway reference.
     */
    private function findPayment(WebhookEvent $event): ?Payment
    {
        // First, try by external reference (our UUID)
        if ($event->paymentUuid) {
            $payment = Payment::where(function ($query) use ($event) {
                $query->where('uuid', $event->paymentUuid);
            })->first();
            if ($payment) {
                return $payment;
            }
        }

        // Fallback to gateway reference
        $gatewayReference = $event->payload['payment']['id'] ?? null;
        if ($gatewayReference) {
            return Payment::where('gateway_reference', $gatewayReference)->first();
        }

        return null;
    }

    /**
     * Persist webhook event for idempotency.
     */
    private function persistEvent(WebhookEvent $event): WebhookEventModel
    {
        return WebhookEventModel::firstOrCreate(
            [
                'provider' => $this->gateway(),
                'provider_event_id' => $event->providerEventId,
                'event_type' => $event->providerEventType,
            ],
            [
                'payment_uuid' => $event->paymentUuid,
                'event_type' => $event->providerEventType,
                'payload' => $event->payload,
                'headers' => $event->headers,
            ]
        );
    }

    /**
     * Extract access token from headers.
     */
    private function extractAccessToken(array $headers): ?string
    {
        // Asaas sends the token in 'asaas-access-token' header
        $possibleKeys = [
            'asaas-access-token',
            'Asaas-Access-Token',
            'ASAAS_ACCESS_TOKEN',
            'HTTP_ASAAS_ACCESS_TOKEN',
        ];

        foreach ($possibleKeys as $key) {
            $lowerKey = strtolower($key);
            foreach ($headers as $headerKey => $value) {
                if (strtolower($headerKey) === $lowerKey) {
                    return is_array($value) ? ($value[0] ?? null) : $value;
                }
            }
        }

        return null;
    }

    /**
     * Normalize headers to consistent format.
     *
     * Sanitizes UTF-8 characters to prevent JSON encoding errors.
     */
    private function normalizeHeaders(array $headers): array
    {
        $normalized = [];
        foreach ($headers as $key => $value) {
            $headerValue = is_array($value) ? ($value[0] ?? null) : $value;
            $normalized[strtolower($key)] = $this->sanitizeUtf8($headerValue);
        }

        return $normalized;
    }

    /**
     * Sanitize string to valid UTF-8.
     *
     * Removes or replaces invalid UTF-8 characters that would cause JSON encoding errors.
     */
    private function sanitizeUtf8(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        // Convert to UTF-8 and remove invalid characters
        $sanitized = mb_convert_encoding($value, 'UTF-8', 'UTF-8');

        // Remove any remaining non-printable characters except common whitespace
        $sanitized = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $sanitized);

        // Ensure valid JSON encoding by testing
        if (json_encode($sanitized) === false) {
            // If still failing, use ASCII-safe version
            $sanitized = preg_replace('/[^\x20-\x7E]/', '', $value);
        }

        return $sanitized;
    }

    /**
     * Map Asaas event type to internal event type.
     */
    private function mapEventType(string $asaasEvent): PaymentEventType
    {
        $asaasEvent = strtoupper($asaasEvent);

        return self::EVENT_MAPPING[$asaasEvent]
            ?? PaymentEventType::fromProviderEvent($this->gateway(), $asaasEvent);
    }

    /**
     * Parse event date from payload.
     */
    private function parseEventDate(array $paymentData): \DateTimeImmutable
    {
        $dateString = $paymentData['dateCreated']
            ?? $paymentData['paymentDate']
            ?? null;

        if ($dateString) {
            try {
                return new \DateTimeImmutable($dateString);
            } catch (\Exception) {
                // Fall through to default
            }
        }

        return new \DateTimeImmutable();
    }

    /**
     * Generate a unique event ID when not provided.
     */
    private function generateEventId(array $payload): string
    {
        return hash('sha256', json_encode($payload) . microtime());
    }

    /**
     * Log with gateway context.
     */
    private function log(string $level, string $message, array $context = []): void
    {
        Log::channel(config('payments.logging.channel', 'stack'))
            ->{$level}("[Webhook:Asaas] {$message}", $context);
    }
}
