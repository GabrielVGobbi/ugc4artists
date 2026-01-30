<?php

declare(strict_types=1);

namespace App\Modules\Payments\DTO;

readonly class RefundResult
{
    public function __construct(
        public string $provider,
        public string $reference,
        public int $refundedAmountCents,
        public bool $isPartialRefund = false,
        public ?string $status = null,
        public array $raw = [],
    ) {}

    public function isSuccessful(): bool
    {
        return in_array($this->status, ['succeeded', 'completed', 'approved', null], true);
    }

    public function isPending(): bool
    {
        return in_array($this->status, ['pending', 'processing'], true);
    }
}
