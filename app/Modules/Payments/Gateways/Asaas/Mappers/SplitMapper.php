<?php

declare(strict_types=1);

namespace App\Modules\Payments\Gateways\Asaas\Mappers;

use App\Modules\Payments\Core\DTOs\Split\SplitCollection;
use App\Modules\Payments\Core\DTOs\Split\SplitRequest;
use App\Modules\Payments\Core\DTOs\Split\SplitResponse;
use App\Modules\Payments\Core\DTOs\Split\SplitRuleRequest;
use App\Modules\Payments\Core\DTOs\Split\SplitRuleResponse;

/**
 * Mapper for converting between generic DTOs and Asaas-specific format.
 */
final class SplitMapper
{
    /**
     * Convert SplitRequest to Asaas API payload.
     */
    public static function toAsaasPayload(SplitRequest $request): array
    {
        return [
            'split' => array_map(
                fn (SplitRuleRequest $rule) => self::ruleToAsaasPayload($rule),
                $request->rules
            ),
        ];
    }

    /**
     * Convert individual SplitRuleRequest to Asaas format.
     */
    public static function ruleToAsaasPayload(SplitRuleRequest $rule): array
    {
        $payload = [
            'walletId' => $rule->walletId,
        ];

        if ($rule->fixedValueCents !== null) {
            $payload['fixedValue'] = $rule->fixedValueCents / 100;
        }

        if ($rule->percentageValue !== null) {
            $payload['percentualValue'] = $rule->percentageValue;
        }

        if ($rule->totalFixedValueCents !== null) {
            $payload['totalFixedValue'] = $rule->totalFixedValueCents / 100;
        }

        if ($rule->externalReference) {
            $payload['externalReference'] = $rule->externalReference;
        }

        if ($rule->description) {
            $payload['description'] = $rule->description;
        }

        return $payload;
    }

    /**
     * Convert Asaas API response to SplitResponse.
     */
    public static function fromAsaasResponse(array $data): SplitResponse
    {
        $rules = array_map(
            fn (array $rule) => self::ruleFromAsaasResponse($rule),
            $data['split'] ?? []
        );

        return new SplitResponse(
            id: (string) ($data['id'] ?? ''),
            provider: 'asaas',
            paymentId: $data['payment'] ?? '',
            rules: $rules,
            status: $data['status'] ?? 'ACTIVE',
            createdAt: isset($data['dateCreated'])
                ? new \DateTimeImmutable($data['dateCreated'])
                : null,
            raw: $data,
        );
    }

    /**
     * Convert individual Asaas split rule to SplitRuleResponse.
     */
    public static function ruleFromAsaasResponse(array $data): SplitRuleResponse
    {
        return new SplitRuleResponse(
            id: (string) ($data['id'] ?? ''),
            walletId: $data['walletId'] ?? '',
            fixedValueCents: isset($data['fixedValue'])
                ? (int) ($data['fixedValue'] * 100)
                : null,
            percentageValue: $data['percentualValue'] ?? null,
            totalFixedValueCents: isset($data['totalFixedValue'])
                ? (int) ($data['totalFixedValue'] * 100)
                : null,
            calculatedValueCents: isset($data['calculatedValue'])
                ? (int) ($data['calculatedValue'] * 100)
                : null,
            status: $data['status'] ?? 'PENDING',
            externalReference: $data['externalReference'] ?? null,
        );
    }

    /**
     * Convert Asaas API list response to SplitCollection.
     */
    public static function toCollection(array $data): SplitCollection
    {
        $items = array_map(
            fn (array $item) => self::fromAsaasResponse($item),
            $data['data'] ?? []
        );

        return new SplitCollection(
            items: $items,
            total: $data['totalCount'] ?? count($items),
            perPage: $data['limit'] ?? 10,
            currentPage: isset($data['offset']) ? (int) ($data['offset'] / ($data['limit'] ?? 10)) + 1 : 1,
            hasMore: $data['hasMore'] ?? false,
        );
    }
}
