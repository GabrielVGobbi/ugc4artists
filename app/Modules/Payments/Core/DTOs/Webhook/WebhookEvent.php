<?php

declare(strict_types=1);

namespace App\Modules\Payments\Core\DTOs\Webhook;

use App\Modules\Payments\Enums\PaymentEventType;
use DateTimeImmutable;

/**
 * DTO for standardized webhook events.
 */
class WebhookEvent
{
    public function __construct(
        public string $provider,
        public string $providerEventId,
        public string $providerEventType,
        public PaymentEventType $eventType,
        public ?string $paymentUuid = null,
        public ?string $providerPaymentId = null,
        public ?string $customerId = null,
        public ?string $subscriptionId = null,
        public ?DateTimeImmutable $eventDate = null,
        public array $payload = [],
        public array $headers = [],
    ) {}

    public static function fromArray(array $data): self
    {
        $provider = $data['provider'] ?? '';
        $providerEventType = $data['provider_event_type'] ?? $data['event'] ?? 'unknown';

        return new self(
            provider: $provider,
            providerEventId: $data['provider_event_id'] ?? $data['id'] ?? sha1(json_encode($data)),
            providerEventType: $providerEventType,
            providerPaymentId: $data['provider_payment_id'],
            eventType: PaymentEventType::fromProviderEvent($provider, $providerEventType),
            paymentUuid: $data['payment_uuid'] ?? $data['externalReference'] ?? $data['external_reference'] ?? null,
            customerId: $data['customer_id'] ?? $data['customerId'] ?? $data['customer'] ?? null,
            subscriptionId: $data['subscription_id'] ?? $data['subscriptionId'] ?? $data['subscription'] ?? null,
            eventDate: isset($data['event_date']) || isset($data['dateCreated'])
                ? new DateTimeImmutable($data['event_date'] ?? $data['dateCreated'])
                : new DateTimeImmutable(),
            payload: $data['payload'] ?? $data,
            headers: $data['headers'] ?? [],
        );
    }

    public function toArray(): array
    {
        return [
            'provider' => $this->provider,
            'provider_event_id' => $this->providerEventId,
            'provider_event_type' => $this->providerEventType,
            'event_type' => $this->eventType->value,
            'payment_uuid' => $this->paymentUuid,
            'customer_id' => $this->customerId,
            'subscription_id' => $this->subscriptionId,
            'event_date' => $this->eventDate?->format('Y-m-d H:i:s'),
        ];
    }

    public function isPaymentEvent(): bool
    {
        return $this->paymentUuid !== null;
    }

    public function isSubscriptionEvent(): bool
    {
        return $this->subscriptionId !== null;
    }

    public function isSuccessfulPayment(): bool
    {
        return $this->eventType->isSuccessful();
    }

    public function isFailedPayment(): bool
    {
        return $this->eventType->isFailed();
    }

    public function isRefundEvent(): bool
    {
        return $this->eventType->isRefund();
    }
}
