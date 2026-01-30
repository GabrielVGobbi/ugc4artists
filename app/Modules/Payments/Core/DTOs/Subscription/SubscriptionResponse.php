<?php

declare(strict_types=1);

namespace App\Modules\Payments\Core\DTOs\Subscription;

use App\Modules\Payments\Enums\PaymentMethod;
use DateTimeImmutable;

/**
 * DTO for subscription responses.
 */
readonly class SubscriptionResponse
{
    public function __construct(
        public string $id,
        public string $provider,
        public string $customerId,
        public int $amountCents,
        public string $status,
        public string $cycle,
        public PaymentMethod $method,
        public ?DateTimeImmutable $startDate = null,
        public ?DateTimeImmutable $endDate = null,
        public ?DateTimeImmutable $nextDueDate = null,
        public ?string $externalReference = null,
        public ?string $description = null,
        public ?DateTimeImmutable $createdAt = null,
        public ?int $paymentCount = null,
        public array $raw = [],
    ) {}

    public static function fromArray(array $data, string $provider = ''): self
    {
        return new self(
            id: (string) $data['id'],
            provider: $provider,
            customerId: $data['customer'] ?? $data['customer_id'] ?? $data['customerId'] ?? '',
            amountCents: isset($data['value'])
                ? (int) ($data['value'] * 100)
                : (int) ($data['amount_cents'] ?? 0),
            status: $data['status'] ?? 'unknown',
            cycle: strtoupper($data['cycle'] ?? $data['billing_type'] ?? 'MONTHLY'),
            method: self::resolvePaymentMethod($data),
            startDate: isset($data['startDate']) || isset($data['start_date'])
                ? new DateTimeImmutable($data['startDate'] ?? $data['start_date'])
                : null,
            endDate: isset($data['endDate']) || isset($data['end_date'])
                ? new DateTimeImmutable($data['endDate'] ?? $data['end_date'])
                : null,
            nextDueDate: isset($data['nextDueDate']) || isset($data['next_due_date'])
                ? new DateTimeImmutable($data['nextDueDate'] ?? $data['next_due_date'])
                : null,
            externalReference: $data['externalReference'] ?? $data['external_reference'] ?? null,
            description: $data['description'] ?? null,
            createdAt: isset($data['dateCreated']) || isset($data['created_at'])
                ? new DateTimeImmutable($data['dateCreated'] ?? $data['created_at'])
                : null,
            paymentCount: $data['paymentCount'] ?? $data['payment_count'] ?? null,
            raw: $data,
        );
    }

    private static function resolvePaymentMethod(array $data): PaymentMethod
    {
        $methodValue = $data['billingType'] ?? $data['method'] ?? 'CREDIT_CARD';

        return match (strtoupper($methodValue)) {
            'PIX' => PaymentMethod::PIX,
            'CREDIT_CARD', 'CREDITCARD' => PaymentMethod::CREDIT_CARD,
            'BOLETO', 'BANK_SLIP' => PaymentMethod::BOLETO,
            default => PaymentMethod::CREDIT_CARD,
        };
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'provider' => $this->provider,
            'customer_id' => $this->customerId,
            'amount_cents' => $this->amountCents,
            'status' => $this->status,
            'cycle' => $this->cycle,
            'method' => $this->method->value,
            'start_date' => $this->startDate?->format('Y-m-d'),
            'end_date' => $this->endDate?->format('Y-m-d'),
            'next_due_date' => $this->nextDueDate?->format('Y-m-d'),
            'external_reference' => $this->externalReference,
            'description' => $this->description,
            'created_at' => $this->createdAt?->format('Y-m-d H:i:s'),
            'payment_count' => $this->paymentCount,
        ];
    }
}
