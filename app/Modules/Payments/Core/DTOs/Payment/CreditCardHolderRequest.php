<?php

declare(strict_types=1);

namespace App\Modules\Payments\Core\DTOs\Payment;

use App\Modules\Payments\Core\DTOs\Shared\AddressRequest;

/**
 * DTO for credit card holder information.
 */
readonly class CreditCardHolderRequest
{
    public function __construct(
        public string $name,
        public string $email,
        public string $document,
        public ?string $phone = null,
        public ?string $birthDate = null,
        public ?AddressRequest $address = null,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            name: $data['name'] ?? '',
            email: $data['email'] ?? '',
            document: $data['document'] ?? $data['cpfCnpj'] ?? $data['cpf_cnpj'] ?? '',
            phone: $data['phone'] ?? $data['mobilePhone'] ?? null,
            birthDate: $data['birth_date'] ?? $data['birthDate'] ?? null,
            address: isset($data['address']) ? AddressRequest::fromArray($data['address']) : null,
        );
    }

    public function toArray(): array
    {
        return array_filter([
            'name' => $this->name,
            'email' => $this->email,
            'document' => $this->document,
            'phone' => $this->phone,
            'birth_date' => $this->birthDate,
            'address' => $this->address?->toArray(),
        ], fn ($value) => $value !== null);
    }
}
