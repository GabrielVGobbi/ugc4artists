<?php

declare(strict_types=1);

namespace App\Modules\Payments\Core\DTOs\Payment;

/**
 * DTO for credit card data in payment requests.
 */
readonly class CreditCardRequest
{
    public function __construct(
        public string $holderName,
        public string $number,
        public string $expiryMonth,
        public string $expiryYear,
        public string $cvv,
        public ?CreditCardHolderRequest $holder = null,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            holderName: $data['holder_name'] ?? $data['holderName'] ?? '',
            number: $data['number'] ?? '',
            expiryMonth: $data['expiry_month'] ?? $data['expiryMonth'] ?? '',
            expiryYear: $data['expiry_year'] ?? $data['expiryYear'] ?? '',
            cvv: $data['cvv'] ?? $data['cvc'] ?? $data['security_code'] ?? '',
            holder: isset($data['holder'])
                ? CreditCardHolderRequest::fromArray($data['holder'])
                : null,
        );
    }

    public function toArray(): array
    {
        return array_filter([
            'holder_name' => $this->holderName,
            'number' => $this->number,
            'expiry_month' => $this->expiryMonth,
            'expiry_year' => $this->expiryYear,
            'cvv' => $this->cvv,
            'holder' => $this->holder?->toArray(),
        ], fn ($value) => $value !== null);
    }
}
