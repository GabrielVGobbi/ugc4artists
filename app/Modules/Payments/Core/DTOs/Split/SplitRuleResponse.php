<?php

declare(strict_types=1);

namespace App\Modules\Payments\Core\DTOs\Split;

/**
 * DTO for individual split rule responses.
 */
readonly class SplitRuleResponse
{
    public function __construct(
        public string $id,
        public string $walletId,
        public ?int $fixedValueCents = null,
        public ?float $percentageValue = null,
        public ?int $totalFixedValueCents = null,
        public ?int $calculatedValueCents = null,
        public string $status = 'PENDING',
        public ?string $externalReference = null,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            id: (string) ($data['id'] ?? ''),
            walletId: $data['walletId'] ?? $data['wallet_id'] ?? '',
            fixedValueCents: isset($data['fixedValue'])
                ? (int) ($data['fixedValue'] * 100)
                : ($data['fixed_value_cents'] ?? null),
            percentageValue: $data['percentualValue'] ?? $data['percentage_value'] ?? null,
            totalFixedValueCents: isset($data['totalFixedValue'])
                ? (int) ($data['totalFixedValue'] * 100)
                : ($data['total_fixed_value_cents'] ?? null),
            calculatedValueCents: isset($data['calculatedValue'])
                ? (int) ($data['calculatedValue'] * 100)
                : ($data['calculated_value_cents'] ?? null),
            status: $data['status'] ?? 'PENDING',
            externalReference: $data['externalReference'] ?? $data['external_reference'] ?? null,
        );
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'wallet_id' => $this->walletId,
            'fixed_value_cents' => $this->fixedValueCents,
            'percentage_value' => $this->percentageValue,
            'total_fixed_value_cents' => $this->totalFixedValueCents,
            'calculated_value_cents' => $this->calculatedValueCents,
            'status' => $this->status,
            'external_reference' => $this->externalReference,
        ];
    }
}
