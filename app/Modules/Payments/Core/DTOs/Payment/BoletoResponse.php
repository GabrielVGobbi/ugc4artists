<?php

declare(strict_types=1);

namespace App\Modules\Payments\Core\DTOs\Payment;

use DateTimeImmutable;

/**
 * DTO for Boleto response.
 */
readonly class BoletoResponse
{
    public function __construct(
        public string $barCode,
        public ?string $url = null,
        public ?string $digitableLine = null,
        public ?DateTimeImmutable $dueDate = null,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            barCode: $data['nossoNumero'] ?? $data['barcode'] ?? $data['bar_code'] ?? '',
            url: $data['bankSlipUrl'] ?? $data['bank_slip_url'] ?? $data['secure_url'] ?? null,
            digitableLine: $data['identificationField'] ?? $data['digitable_line'] ?? null,
            dueDate: isset($data['dueDate']) || isset($data['due_date'])
                ? new DateTimeImmutable($data['dueDate'] ?? $data['due_date'])
                : null,
        );
    }

    public function toArray(): array
    {
        return [
            'bar_code' => $this->barCode,
            'url' => $this->url,
            'digitable_line' => $this->digitableLine,
            'due_date' => $this->dueDate?->format('Y-m-d'),
        ];
    }
}
