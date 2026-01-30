<?php

declare(strict_types=1);

namespace App\Modules\Payments\Gateways\Asaas\Mappers;

use App\Modules\Payments\Core\DTOs\Customer\CustomerCollection;
use App\Modules\Payments\Core\DTOs\Customer\CustomerRequest;
use App\Modules\Payments\Core\DTOs\Customer\CustomerResponse;
use App\Modules\Payments\Core\DTOs\Shared\AddressResponse;

/**
 * Mapper for converting between generic DTOs and Asaas-specific format.
 */
final class CustomerMapper
{
    /**
     * Convert CustomerRequest to Asaas API payload.
     */
    public static function toAsaasPayload(CustomerRequest $request): array
    {
        $payload = [
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
        ];

        if ($request->document) {
            $payload['cpfCnpj'] = preg_replace('/\D/', '', $request->document);
        }

        if ($request->phone) {
            $phone = preg_replace('/\D/', '', $request->phone);
            // Asaas uses separate fields for phone
            if (strlen($phone) === 11) {
                $payload['mobilePhone'] = $phone;
            } else {
                $payload['phone'] = $phone;
            }
        }

        if ($request->externalReference) {
            $slug_app = !empty(config('payments.customer.slug')) ? config('payments.customer.slug') . '-' : '';
            $payload['externalReference'] = slug($slug_app . $request->externalReference, '-');
        }

        if ($request->companyName) {
            $payload['company'] = $request->companyName;
        }

        if ($request->personType) {
            $payload['personType'] = strtoupper($request->personType);
        }

        if ($request->notifyByEmail !== null) {
            $payload['notificationDisabled'] = ! $request->notifyByEmail;
        }

        if ($request->address) {
            $payload['address'] = $request->address->street;
            $payload['addressNumber'] = $request->address->number;
            $payload['province'] = $request->address->neighborhood;
            $payload['city'] = $request->address->city;
            $payload['state'] = $request->address->state;
            $payload['postalCode'] = preg_replace('/\D/', '', $request->address->postalCode);

            if ($request->address->complement) {
                $payload['complement'] = $request->address->complement;
            }
        }

        return $payload;
    }

    /**
     * Convert Asaas API response to CustomerResponse.
     */
    public static function fromAsaasResponse(array $data): CustomerResponse
    {
        $address = null;

        if (! empty($data['address']) || ! empty($data['city'])) {
            $address = new AddressResponse(
                street: $data['address'] ?? '',
                number: $data['addressNumber'] ?? '',
                neighborhood: $data['province'] ?? '',
                city: $data['cityName'] ?? '',
                state: $data['state'] ?? '',
                postalCode: $data['postalCode'] ?? '',
                complement: $data['complement'] ?? null,
                country: 'BR',
            );
        }

        return new CustomerResponse(
            id: (string) $data['id'],
            name: $data['name'] ?? '',
            email: $data['email'] ?? '',
            document: $data['cpfCnpj'] ?? null,
            phone: $data['mobilePhone'] ?? $data['phone'] ?? null,
            address: $address,
            externalReference: $data['externalReference'] ?? null,
            companyName: $data['company'] ?? null,
            personType: $data['personType'] ?? null,
            createdAt: isset($data['dateCreated'])
                ? new \DateTimeImmutable($data['dateCreated'])
                : null,
            raw: $data,
        );
    }

    /**
     * Convert Asaas API list response to CustomerCollection.
     */
    public static function toCollection(array $data): CustomerCollection
    {
        $items = array_map(
            fn(array $item) => self::fromAsaasResponse($item),
            $data['data'] ?? []
        );

        return new CustomerCollection(
            items: $items,
            total: $data['totalCount'] ?? count($items),
            perPage: $data['limit'] ?? 10,
            currentPage: isset($data['offset']) ? (int) ($data['offset'] / ($data['limit'] ?? 10)) + 1 : 1,
            hasMore: $data['hasMore'] ?? false,
        );
    }
}
