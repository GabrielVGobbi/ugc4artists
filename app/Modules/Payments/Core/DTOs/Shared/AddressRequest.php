<?php

declare(strict_types=1);

namespace App\Modules\Payments\Core\DTOs\Shared;

/**
 * DTO for address data in requests.
 */
class AddressRequest
{
    public function __construct(
        public ?string $name = null,
        public ?string $street = null,
        public string $number,
        public ?string $neighborhood = null,
        public ?string $city = null,
        public ?string $state = null,
        public string $postalCode,
        public ?string $complement = null,
        public string $country = 'BR',
    ) {}


    public static function fromArray(array $data): self
    {
        return new self(
            name: $data['name'] ?? '',
            street: $data['street'] ?? $data['address'] ?? '',
            number: $data['number'] ?? $data['addressNumber'] ?? '',
            neighborhood: $data['neighborhood'] ?? $data['province'] ?? '',
            city: $data['city'] ?? '',
            state: $data['state'] ?? '',
            postalCode: $data['postal_code'] ?? $data['postalCode'] ?? $data['cep'] ?? $data['zipcode'] ?? '',
            complement: $data['complement'] ?? null,
            country: $data['country'] ?? 'BR',
        );
    }

    public function toArray(): array
    {
        return array_filter([
            'name' => $this->name,
            'street' => $this->street,
            'number' => $this->number,
            'neighborhood' => $this->neighborhood,
            'city' => $this->city,
            'state' => $this->state,
            'postal_code' => $this->postalCode,
            'complement' => $this->complement,
            'country' => $this->country,
        ], fn($value) => $value !== null);
    }
}
