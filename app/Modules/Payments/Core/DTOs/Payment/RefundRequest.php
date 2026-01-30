<?php

declare(strict_types=1);

namespace App\Modules\Payments\Core\DTOs\Payment;

/**
 * DTO for refund requests.
 */
readonly class RefundRequest
{
    public function __construct(
        public ?int $amountCents = null,
        public ?string $description = null,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            amountCents: $data['amount_cents'] ?? $data['amountCents'] ?? $data['value'] ?? null,
            description: $data['description'] ?? null,
        );
    }

    public function toArray(): array
    {
        return array_filter([
            'amount_cents' => $this->amountCents,
            'description' => $this->description,
        ], fn ($value) => $value !== null);
    }

    public function isPartial(): bool
    {
        return $this->amountCents !== null;
    }
}
