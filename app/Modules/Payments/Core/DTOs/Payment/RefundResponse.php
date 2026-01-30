<?php

declare(strict_types=1);

namespace App\Modules\Payments\Core\DTOs\Payment;

use DateTimeImmutable;

/**
 * DTO for refund responses.
 */
readonly class RefundResponse
{
    public function __construct(
        public string $id,
        public string $provider,
        public int $refundedAmountCents,
        public bool $isPartialRefund,
        public string $status,
        public ?DateTimeImmutable $refundedAt = null,
        public array $raw = [],
    ) {}

    public static function fromArray(array $data, string $provider = '', int $originalAmountCents = 0): self
    {
        $refundedAmount = isset($data['value'])
            ? (int) ($data['value'] * 100)
            : (int) ($data['refunded_amount_cents'] ?? $data['amount'] ?? 0);

        return new self(
            id: (string) ($data['id'] ?? ''),
            provider: $provider,
            refundedAmountCents: $refundedAmount,
            isPartialRefund: $originalAmountCents > 0 && $refundedAmount < $originalAmountCents,
            status: $data['status'] ?? 'refunded',
            refundedAt: isset($data['refundedAt']) || isset($data['refunded_at'])
                ? new DateTimeImmutable($data['refundedAt'] ?? $data['refunded_at'])
                : new DateTimeImmutable(),
            raw: $data,
        );
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'provider' => $this->provider,
            'refunded_amount_cents' => $this->refundedAmountCents,
            'is_partial_refund' => $this->isPartialRefund,
            'status' => $this->status,
            'refunded_at' => $this->refundedAt?->format('Y-m-d H:i:s'),
        ];
    }
}
