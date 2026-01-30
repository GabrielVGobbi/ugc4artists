<?php

declare(strict_types=1);

namespace App\Modules\Payments\Core\DTOs\Customer;

use App\Modules\Payments\Core\DTOs\Shared\AddressRequest;
use Illuminate\Database\Eloquent\Model;

/**
 * DTO for customer creation/update requests.
 */
class CustomerRequest
{
    public function __construct(
        public string $name,
        public string $email,
        public ?string $document = null,
        public ?string $phone = null,
        public ?AddressRequest $address = null,
        public ?string $externalReference = null,
        public ?string $companyName = null,
        public ?string $personType = null,
        public ?bool $notifyByEmail = false,
        public array $meta = [],
    ) {}

    /**
     * Create a CustomerRequest from a User model
     *
     * The model should have the following attributes:
     * - name (required)
     * - email (required)
     * - document or cpf or cnpj (optional)
     * - phone (optional)
     * - company_name (optional)
     *
     */
    public static function fromModel(Model $model): self
    {
        // Try to get document from various possible attribute names
        $document = $model->document
            ?? $model->cpf
            ?? $model->cnpj
            ?? $model->cpf_cnpj
            ?? null;

        // Build address if model has address attributes or relationship
        $address = null;
        if (method_exists($model, 'getDefaultAddress')) {
            $addressData = $model->getDefaultAddress();
            if ($addressData) {
                $address = AddressRequest::fromArray((array) $addressData);
            }
        } elseif ($model->address_street || $model->street) {
            $address = new AddressRequest(
                street: $model->address_street ?? $model->street ?? '',
                number: $model->address_number ?? $model->number ?? '',
                complement: $model->address_complement ?? $model->complement ?? null,
                neighborhood: $model->address_neighborhood ?? $model->neighborhood ?? '',
                city: $model->address_city ?? $model->city ?? '',
                state: $model->address_state ?? $model->state ?? '',
                postalCode: $model->address_postal_code ?? $model->postal_code ?? $model->zipcode ?? '',
            );
        }

        return new self(
            name: $model->name,
            email: $model->email,
            document: $document,
            phone: $model->phone ?? $model->mobile ?? null,
            address: $address,
            externalReference: (string) $model->getKey(),
            companyName: $model->company_name ?? $model->company ?? null,
            personType: $model->person_type ?? null,
            notifyByEmail: $model->notify_by_email ?? false,
            meta: [
                'model_type' => get_class($model),
                'model_id' => $model->getKey(),
            ],
        );
    }

    public static function fromUser(Model $user): self
    {
        return self::fromModel($user);
    }

    public static function fromArray(array $data): self
    {
        return new self(
            name: $data['name'],
            email: $data['email'],
            document: $data['document'] ?? $data['cpf'] ?? $data['cnpj'] ?? $data['cpfCnpj'] ?? null,
            phone: $data['phone'] ?? null,
            address: isset($data['address']) ? AddressRequest::fromArray($data['address']) : null,
            externalReference: $data['external_reference'] ?? $data['externalReference'] ?? null,
            companyName: $data['company_name'] ?? $data['companyName'] ?? null,
            personType: $data['person_type'] ?? $data['personType'] ?? null,
            notifyByEmail: $data['notify_by_email'] ?? $data['notifyByEmail'] ?? true,
            meta: $data['meta'] ?? [],
        );
    }

    public function toArray(): array
    {
        return array_filter([
            'name' => $this->name,
            'email' => $this->email,
            'document' => $this->document,
            'phone' => $this->phone,
            'address' => $this->address?->toArray(),
            'external_reference' => $this->externalReference,
            'company_name' => $this->companyName,
            'person_type' => $this->personType,
            'notify_by_email' => $this->notifyByEmail,
            'meta' => $this->meta,
        ], fn ($value) => $value !== null && $value !== []);
    }
}
