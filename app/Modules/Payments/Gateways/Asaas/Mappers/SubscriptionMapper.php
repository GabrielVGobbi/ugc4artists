<?php

declare(strict_types=1);

namespace App\Modules\Payments\Gateways\Asaas\Mappers;

use App\Modules\Payments\Core\DTOs\Subscription\SubscriptionCollection;
use App\Modules\Payments\Core\DTOs\Subscription\SubscriptionRequest;
use App\Modules\Payments\Core\DTOs\Subscription\SubscriptionResponse;
use App\Modules\Payments\Enums\PaymentMethod;

/**
 * Mapper for converting between generic DTOs and Asaas-specific format.
 */
final class SubscriptionMapper
{
    /**
     * Convert SubscriptionRequest to Asaas API payload.
     */
    public static function toAsaasPayload(SubscriptionRequest $request): array
    {
        $payload = [
            'customer' => $request->customerId,
            'billingType' => self::mapPaymentMethod($request->method),
            'value' => $request->amountCents / 100,
            'cycle' => self::mapCycle($request->cycle),
        ];

        if ($request->startDate) {
            $payload['nextDueDate'] = $request->startDate->format('Y-m-d');
        }

        if ($request->endDate) {
            $payload['endDate'] = $request->endDate->format('Y-m-d');
        }

        if ($request->description) {
            $payload['description'] = $request->description;
        }

        if ($request->externalReference) {
            $payload['externalReference'] = $request->externalReference;
        }

        if ($request->maxPayments) {
            $payload['maxPayments'] = $request->maxPayments;
        }

        if ($request->interestValue !== null) {
            $payload['interest'] = ['value' => $request->interestValue];
        }

        if ($request->fineValue !== null) {
            $payload['fine'] = ['value' => $request->fineValue];
        }

        if ($request->discountValue !== null) {
            $payload['discount'] = [
                'value' => $request->discountValue,
                'dueDateLimitDays' => 0,
            ];
        }

        return $payload;
    }

    /**
     * Convert Asaas API response to SubscriptionResponse.
     */
    public static function fromAsaasResponse(array $data): SubscriptionResponse
    {
        return new SubscriptionResponse(
            id: (string) $data['id'],
            provider: 'asaas',
            customerId: $data['customer'] ?? '',
            amountCents: (int) (($data['value'] ?? 0) * 100),
            status: $data['status'] ?? 'ACTIVE',
            cycle: self::resolveCycle($data['cycle'] ?? 'MONTHLY'),
            method: self::resolvePaymentMethod($data['billingType'] ?? 'CREDIT_CARD'),
            startDate: isset($data['dateCreated'])
                ? new \DateTimeImmutable($data['dateCreated'])
                : null,
            endDate: isset($data['endDate'])
                ? new \DateTimeImmutable($data['endDate'])
                : null,
            nextDueDate: isset($data['nextDueDate'])
                ? new \DateTimeImmutable($data['nextDueDate'])
                : null,
            externalReference: $data['externalReference'] ?? null,
            description: $data['description'] ?? null,
            createdAt: isset($data['dateCreated'])
                ? new \DateTimeImmutable($data['dateCreated'])
                : null,
            paymentCount: $data['paymentCount'] ?? null,
            raw: $data,
        );
    }

    /**
     * Convert Asaas API list response to SubscriptionCollection.
     */
    public static function toCollection(array $data): SubscriptionCollection
    {
        $items = array_map(
            fn (array $item) => self::fromAsaasResponse($item),
            $data['data'] ?? []
        );

        return new SubscriptionCollection(
            items: $items,
            total: $data['totalCount'] ?? count($items),
            perPage: $data['limit'] ?? 10,
            currentPage: isset($data['offset']) ? (int) ($data['offset'] / ($data['limit'] ?? 10)) + 1 : 1,
            hasMore: $data['hasMore'] ?? false,
        );
    }

    /**
     * Map PaymentMethod enum to Asaas billing type.
     */
    public static function mapPaymentMethod(PaymentMethod $method): string
    {
        return match ($method) {
            PaymentMethod::PIX => 'PIX',
            PaymentMethod::CREDIT_CARD => 'CREDIT_CARD',
            PaymentMethod::BOLETO => 'BOLETO',
            default => 'CREDIT_CARD',
        };
    }

    /**
     * Resolve PaymentMethod from Asaas billing type.
     */
    public static function resolvePaymentMethod(string $billingType): PaymentMethod
    {
        return match (strtoupper($billingType)) {
            'PIX' => PaymentMethod::PIX,
            'CREDIT_CARD' => PaymentMethod::CREDIT_CARD,
            'BOLETO' => PaymentMethod::BOLETO,
            default => PaymentMethod::CREDIT_CARD,
        };
    }

    /**
     * Map cycle to Asaas format.
     */
    public static function mapCycle(string $cycle): string
    {
        return match (strtoupper($cycle)) {
            'WEEKLY' => 'WEEKLY',
            'BIWEEKLY' => 'BIWEEKLY',
            'MONTHLY' => 'MONTHLY',
            'BIMONTHLY' => 'BIMONTHLY',
            'QUARTERLY' => 'QUARTERLY',
            'SEMIANNUALLY' => 'SEMIANNUALLY',
            'YEARLY', 'ANNUALLY' => 'YEARLY',
            default => 'MONTHLY',
        };
    }

    /**
     * Resolve cycle from Asaas format.
     */
    public static function resolveCycle(string $cycle): string
    {
        return strtoupper($cycle);
    }
}
