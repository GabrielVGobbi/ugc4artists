<?php

declare(strict_types=1);

namespace App\Modules\Payments\Core\DTOs\Customer;

use App\Modules\Payments\Core\DTOs\Shared\AddressResponse;
use DateTimeImmutable;

/**
 * DTO for customer responses.
 */
readonly class CustomerResponse
{
    public function __construct(
        public string $id,
        public string $name,
        public string $email,
        public ?string $document = null,
        public ?string $phone = null,
        public ?AddressResponse $address = null,
        public ?string $externalReference = null,
        public ?string $companyName = null,
        public ?string $personType = null,
        public ?DateTimeImmutable $createdAt = null,
        public ?DateTimeImmutable $updatedAt = null,
        public array $raw = [],
    ) {}

    public static function fromArray(array $data, string $provider = ''): self
    {
        return new self(
            id: (string) $data['id'],
            name: $data['name'] ?? '',
            email: $data['email'] ?? '',
            document: $data['document'] ?? $data['cpfCnpj'] ?? $data['cpf_cnpj'] ?? null,
            phone: $data['phone'] ?? $data['mobilePhone'] ?? $data['mobile_phone'] ?? null,
            address: isset($data['address']) ? AddressResponse::fromArray($data['address']) : null,
            externalReference: $data['externalReference'] ?? $data['external_reference'] ?? null,
            companyName: $data['companyName'] ?? $data['company_name'] ?? null,
            personType: $data['personType'] ?? $data['person_type'] ?? null,
            createdAt: isset($data['dateCreated']) || isset($data['created_at'])
                ? new DateTimeImmutable($data['dateCreated'] ?? $data['created_at'])
                : null,
            updatedAt: isset($data['dateUpdated']) || isset($data['updated_at'])
                ? new DateTimeImmutable($data['dateUpdated'] ?? $data['updated_at'])
                : null,
            raw: $data,
        );
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'document' => $this->document,
            'phone' => $this->phone,
            'address' => $this->address?->toArray(),
            'external_reference' => $this->externalReference,
            'company_name' => $this->companyName,
            'person_type' => $this->personType,
            'created_at' => $this->createdAt?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updatedAt?->format('Y-m-d H:i:s'),
        ];
    }
}
