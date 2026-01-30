<?php

declare(strict_types=1);

namespace App\Modules\Payments\Core\DTOs\Split;

use DateTimeImmutable;

/**
 * DTO for payment split configuration responses.
 */
readonly class SplitResponse
{
    /**
     * @param SplitRuleResponse[] $rules
     */
    public function __construct(
        public string $id,
        public string $provider,
        public string $paymentId,
        public array $rules,
        public string $status,
        public ?DateTimeImmutable $createdAt = null,
        public array $raw = [],
    ) {}

    public static function fromArray(array $data, string $provider = ''): self
    {
        $rules = array_map(
            fn (array $rule) => SplitRuleResponse::fromArray($rule),
            $data['split'] ?? $data['rules'] ?? []
        );

        return new self(
            id: (string) ($data['id'] ?? ''),
            provider: $provider,
            paymentId: $data['payment'] ?? $data['payment_id'] ?? $data['paymentId'] ?? '',
            rules: $rules,
            status: $data['status'] ?? 'active',
            createdAt: isset($data['dateCreated']) || isset($data['created_at'])
                ? new DateTimeImmutable($data['dateCreated'] ?? $data['created_at'])
                : null,
            raw: $data,
        );
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'provider' => $this->provider,
            'payment_id' => $this->paymentId,
            'rules' => array_map(fn (SplitRuleResponse $rule) => $rule->toArray(), $this->rules),
            'status' => $this->status,
            'created_at' => $this->createdAt?->format('Y-m-d H:i:s'),
        ];
    }
}
