<?php

declare(strict_types=1);

namespace App\Modules\Payments\Core\DTOs\Payment;

/**
 * DTO for credit card payment result.
 */
readonly class CreditCardResult
{
    public function __construct(
        public bool $approved,
        public ?string $lastDigits = null,
        public ?string $brand = null,
        public ?string $authorizationCode = null,
        public ?string $errorMessage = null,
        public ?string $errorCode = null,
    ) {}

    public static function approved(
        ?string $lastDigits = null,
        ?string $brand = null,
        ?string $authorizationCode = null,
    ): self {
        return new self(
            approved: true,
            lastDigits: $lastDigits,
            brand: $brand,
            authorizationCode: $authorizationCode,
        );
    }

    public static function declined(
        ?string $errorMessage = null,
        ?string $errorCode = null,
    ): self {
        return new self(
            approved: false,
            errorMessage: $errorMessage,
            errorCode: $errorCode,
        );
    }

    public static function fromAsaasResponse(array $data): self
    {
        $status = $data['status'] ?? '';
        $isApproved = in_array($status, ['CONFIRMED', 'RECEIVED', 'PENDING'], true);

        if ($isApproved && isset($data['creditCard'])) {
            return self::approved(
                lastDigits: $data['creditCard']['creditCardNumber'] ?? null,
                brand: $data['creditCard']['creditCardBrand'] ?? null,
            );
        }

        if (! $isApproved) {
            return self::declined(
                errorMessage: $data['errors'][0]['description'] ?? 'Pagamento recusado',
                errorCode: $data['errors'][0]['code'] ?? null,
            );
        }

        return new self(approved: $isApproved);
    }

    public function toArray(): array
    {
        return [
            'approved' => $this->approved,
            'last_digits' => $this->lastDigits,
            'brand' => $this->brand,
            'authorization_code' => $this->authorizationCode,
            'error_message' => $this->errorMessage,
            'error_code' => $this->errorCode,
        ];
    }
}
