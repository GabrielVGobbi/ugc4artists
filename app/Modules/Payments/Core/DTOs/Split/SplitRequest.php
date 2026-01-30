<?php

declare(strict_types=1);

namespace App\Modules\Payments\Core\DTOs\Split;

/**
 * DTO for payment split configuration requests.
 */
readonly class SplitRequest
{
    /**
     * @param SplitRuleRequest[] $rules
     */
    public function __construct(
        public string $paymentId,
        public array $rules,
        public ?string $externalReference = null,
        public array $meta = [],
    ) {}

    public static function fromArray(array $data): self
    {
        $rules = array_map(
            fn (array $rule) => SplitRuleRequest::fromArray($rule),
            $data['rules'] ?? $data['split'] ?? []
        );

        return new self(
            paymentId: $data['payment_id'] ?? $data['paymentId'] ?? '',
            rules: $rules,
            externalReference: $data['external_reference'] ?? $data['externalReference'] ?? null,
            meta: $data['meta'] ?? [],
        );
    }

    public function toArray(): array
    {
        return array_filter([
            'payment_id' => $this->paymentId,
            'rules' => array_map(fn (SplitRuleRequest $rule) => $rule->toArray(), $this->rules),
            'external_reference' => $this->externalReference,
            'meta' => $this->meta,
        ], fn ($value) => $value !== null && $value !== []);
    }
}
