<?php

declare(strict_types=1);

namespace App\Modules\Payments\Core\DTOs\Subscription;

use App\Modules\Payments\Enums\PaymentMethod;
use DateTimeInterface;

/**
 * DTO for subscription creation/update requests.
 */
readonly class SubscriptionRequest
{
    public function __construct(
        public string $customerId,
        public int $amountCents,
        public string $cycle = 'MONTHLY',
        public PaymentMethod $method = PaymentMethod::CREDIT_CARD,
        public ?DateTimeInterface $startDate = null,
        public ?DateTimeInterface $endDate = null,
        public ?string $description = null,
        public ?string $externalReference = null,
        public ?int $maxPayments = null,
        public ?float $discountValue = null,
        public ?float $interestValue = null,
        public ?float $fineValue = null,
        public array $meta = [],
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            customerId: $data['customer_id'] ?? $data['customerId'] ?? $data['customer'],
            amountCents: (int) ($data['amount_cents'] ?? $data['amountCents'] ?? ($data['value'] ?? 0) * 100),
            cycle: strtoupper($data['cycle'] ?? $data['billing_type'] ?? 'MONTHLY'),
            method: $data['method'] instanceof PaymentMethod
                ? $data['method']
                : PaymentMethod::tryFrom($data['method'] ?? 'credit_card') ?? PaymentMethod::CREDIT_CARD,
            startDate: isset($data['start_date']) || isset($data['startDate'])
                ? new \DateTimeImmutable($data['start_date'] ?? $data['startDate'])
                : null,
            endDate: isset($data['end_date']) || isset($data['endDate'])
                ? new \DateTimeImmutable($data['end_date'] ?? $data['endDate'])
                : null,
            description: $data['description'] ?? null,
            externalReference: $data['external_reference'] ?? $data['externalReference'] ?? null,
            maxPayments: $data['max_payments'] ?? $data['maxPayments'] ?? null,
            discountValue: $data['discount_value'] ?? $data['discountValue'] ?? null,
            interestValue: $data['interest_value'] ?? $data['interestValue'] ?? null,
            fineValue: $data['fine_value'] ?? $data['fineValue'] ?? null,
            meta: $data['meta'] ?? [],
        );
    }

    public function toArray(): array
    {
        return array_filter([
            'customer_id' => $this->customerId,
            'amount_cents' => $this->amountCents,
            'cycle' => $this->cycle,
            'method' => $this->method->value,
            'start_date' => $this->startDate?->format('Y-m-d'),
            'end_date' => $this->endDate?->format('Y-m-d'),
            'description' => $this->description,
            'external_reference' => $this->externalReference,
            'max_payments' => $this->maxPayments,
            'discount_value' => $this->discountValue,
            'interest_value' => $this->interestValue,
            'fine_value' => $this->fineValue,
            'meta' => $this->meta,
        ], fn ($value) => $value !== null && $value !== []);
    }
}
