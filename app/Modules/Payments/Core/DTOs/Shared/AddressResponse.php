<?php

declare(strict_types=1);

namespace App\Modules\Payments\Core\DTOs\Shared;

/**
 * DTO for address data in responses.
 */
readonly class AddressResponse
{
    public function __construct(
        public string $street,
        public string $number,
        public string $neighborhood,
        public string $city,
        public string $state,
        public string $postalCode,
        public ?string $complement = null,
        public string $country = 'BR',
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            street: $data['street'] ?? $data['address'] ?? '',
            number: $data['number'] ?? $data['addressNumber'] ?? '',
            neighborhood: $data['neighborhood'] ?? $data['province'] ?? '',
            city: $data['city'] ?? '',
            state: $data['state'] ?? '',
            postalCode: $data['postal_code'] ?? $data['postalCode'] ?? $data['cep'] ?? '',
            complement: $data['complement'] ?? null,
            country: $data['country'] ?? 'BR',
        );
    }

    public function toArray(): array
    {
        return [
            'street' => $this->street,
            'number' => $this->number,
            'neighborhood' => $this->neighborhood,
            'city' => $this->city,
            'state' => $this->state,
            'postal_code' => $this->postalCode,
            'complement' => $this->complement,
            'country' => $this->country,
        ];
    }
}
