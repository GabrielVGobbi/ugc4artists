<?php

declare(strict_types=1);

namespace App\Modules\Payments\Core\DTOs\Split;

/**
 * DTO for individual split rule requests.
 */
readonly class SplitRuleRequest
{
    public function __construct(
        public string $walletId,
        public ?int $fixedValueCents = null,
        public ?float $percentageValue = null,
        public ?int $totalFixedValueCents = null,
        public ?string $externalReference = null,
        public ?string $description = null,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            walletId: $data['wallet_id'] ?? $data['walletId'] ?? '',
            fixedValueCents: isset($data['fixed_value']) || isset($data['fixedValue'])
                ? (int) (($data['fixed_value'] ?? $data['fixedValue']) * 100)
                : ($data['fixed_value_cents'] ?? $data['fixedValueCents'] ?? null),
            percentageValue: $data['percentage_value'] ?? $data['percentageValue'] ?? null,
            totalFixedValueCents: isset($data['total_fixed_value']) || isset($data['totalFixedValue'])
                ? (int) (($data['total_fixed_value'] ?? $data['totalFixedValue']) * 100)
                : ($data['total_fixed_value_cents'] ?? null),
            externalReference: $data['external_reference'] ?? $data['externalReference'] ?? null,
            description: $data['description'] ?? null,
        );
    }

    public function toArray(): array
    {
        return array_filter([
            'wallet_id' => $this->walletId,
            'fixed_value_cents' => $this->fixedValueCents,
            'percentage_value' => $this->percentageValue,
            'total_fixed_value_cents' => $this->totalFixedValueCents,
            'external_reference' => $this->externalReference,
            'description' => $this->description,
        ], fn ($value) => $value !== null);
    }

    public function isPercentageBased(): bool
    {
        return $this->percentageValue !== null;
    }

    public function isFixedValue(): bool
    {
        return $this->fixedValueCents !== null;
    }
}
