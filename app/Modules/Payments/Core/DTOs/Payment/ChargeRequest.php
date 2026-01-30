<?php

declare(strict_types=1);

namespace App\Modules\Payments\Core\DTOs\Payment;

use App\Modules\Payments\Core\DTOs\Split\SplitRuleRequest;
use App\Modules\Payments\Enums\PaymentMethod;
use DateTimeInterface;

/**
 * DTO for charge/payment creation requests.
 */
readonly class ChargeRequest
{
    /**
     * @param SplitRuleRequest[]|null $splits
     */
    public function __construct(
        public string $customerId,
        public int $amountCents,
        public PaymentMethod $method = PaymentMethod::PIX,
        public ?DateTimeInterface $dueDate = null,
        public ?string $description = null,
        public ?string $externalReference = null,
        public ?CreditCardRequest $creditCard = null,
        public ?array $splits = null,
        public ?int $installments = null,
        public ?float $interestValue = null,
        public ?float $fineValue = null,
        public ?float $discountValue = null,
        public ?DateTimeInterface $discountDate = null,
        public array $meta = [],
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            customerId: $data['customer_id'] ?? $data['customerId'] ?? $data['customer'],
            amountCents: (int) ($data['amount_cents'] ?? $data['amountCents'] ?? $data['value'] * 100),
            method: $data['method'] instanceof PaymentMethod
                ? $data['method']
                : PaymentMethod::tryFrom($data['method'] ?? $data['payment_method'] ?? 'pix') ?? PaymentMethod::PIX,
            dueDate: isset($data['due_date']) || isset($data['dueDate'])
                ? new \DateTimeImmutable($data['due_date'] ?? $data['dueDate'])
                : null,
            description: $data['description'] ?? null,
            externalReference: $data['external_reference'] ?? $data['externalReference'] ?? null,
            creditCard: isset($data['credit_card']) || isset($data['creditCard'])
                ? CreditCardRequest::fromArray($data['credit_card'] ?? $data['creditCard'])
                : null,
            splits: isset($data['splits'])
                ? array_map(fn($s) => SplitRuleRequest::fromArray($s), $data['splits'])
                : null,
            installments: $data['installments'] ?? $data['installmentCount'] ?? null,
            interestValue: $data['interest_value'] ?? $data['interestValue'] ?? null,
            fineValue: $data['fine_value'] ?? $data['fineValue'] ?? null,
            discountValue: $data['discount_value'] ?? $data['discountValue'] ?? null,
            discountDate: isset($data['discount_date']) || isset($data['discountDate'])
                ? new \DateTimeImmutable($data['discount_date'] ?? $data['discountDate'])
                : null,
            meta: $data['meta'] ?? [],
        );
    }

    public function toArray(): array
    {
        return array_filter([
            'customer_id' => $this->customerId,
            'amount_cents' => $this->amountCents,
            'method' => $this->method->value,
            'due_date' => $this->dueDate?->format('Y-m-d'),
            'description' => $this->description,
            'external_reference' => $this->externalReference,
            'credit_card' => $this->creditCard?->toArray(),
            'splits' => $this->splits ? array_map(fn($s) => $s->toArray(), $this->splits) : null,
            'installments' => $this->installments,
            'interest_value' => $this->interestValue,
            'fine_value' => $this->fineValue,
            'discount_value' => $this->discountValue,
            'discount_date' => $this->discountDate?->format('Y-m-d'),
            'meta' => $this->meta,
        ], fn($value) => $value !== null && $value !== []);
    }
}
