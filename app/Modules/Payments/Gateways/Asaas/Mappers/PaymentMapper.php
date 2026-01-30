<?php

declare(strict_types=1);

namespace App\Modules\Payments\Gateways\Asaas\Mappers;

use App\Modules\Payments\Core\DTOs\Payment\BoletoResponse;
use App\Modules\Payments\Core\DTOs\Payment\ChargeCollection;
use App\Modules\Payments\Core\DTOs\Payment\ChargeRequest;
use App\Modules\Payments\Core\DTOs\Payment\ChargeResponse;
use App\Modules\Payments\Core\DTOs\Payment\PixQrCodeResponse;
use App\Modules\Payments\Core\DTOs\Payment\RefundResponse;
use App\Modules\Payments\Enums\PaymentMethod;

/**
 * Mapper for converting between generic DTOs and Asaas-specific format.
 */
final class PaymentMapper
{
    /**
     * Convert ChargeRequest to Asaas API payload.
     */
    public static function toAsaasPayload(ChargeRequest $request): array
    {
        $payload = [
            'customer' => $request->customerId,
            'billingType' => self::mapPaymentMethod($request->method),
            'value' => $request->amountCents / 100,
            'dueDate' => $request->dueDate?->format('Y-m-d') ?? now()->addDays(3)->format('Y-m-d'),
        ];

        if ($request->description) {
            $payload['description'] = $request->description;
        }

        if ($request->externalReference) {
            $payload['externalReference'] = $request->externalReference;
        }

        if ($request->installments && $request->installments > 1) {
            $payload['installmentCount'] = $request->installments;
            $payload['installmentValue'] = $request->amountCents / 100 / $request->installments;
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

            if ($request->discountDate) {
                $dueDays = now()->diffInDays($request->discountDate);
                $payload['discount']['dueDateLimitDays'] = max(0, $dueDays);
            }
        }

        // Credit card specific data
        if ($request->method === PaymentMethod::CREDIT_CARD && $request->creditCard) {
            $payload['creditCard'] = [
                'holderName' => $request->creditCard->holderName,
                'number' => $request->creditCard->number,
                'expiryMonth' => $request->creditCard->expiryMonth,
                'expiryYear' => $request->creditCard->expiryYear,
                'ccv' => $request->creditCard->cvv,
            ];

            if ($request->creditCard->holder) {
                $payload['creditCardHolderInfo'] = [
                    'name' => $request->creditCard->holder->name,
                    'email' => $request->creditCard->holder->email,
                    'cpfCnpj' => preg_replace('/\D/', '', $request->creditCard->holder->document),
                    'phone' => $request->creditCard->holder->phone,
                    'postalCode' => $request->creditCard->holder->address?->postalCode,
                    'addressNumber' => $request->creditCard->holder->address?->number,
                ];
            }
        }

        // Split configuration
        if ($request->splits && count($request->splits) > 0) {
            $payload['split'] = array_map(fn ($split) => SplitMapper::ruleToAsaasPayload($split), $request->splits);
        }

        return $payload;
    }

    /**
     * Convert Asaas API response to ChargeResponse.
     */
    public static function fromAsaasResponse(array $data): ChargeResponse
    {
        $pix = null;
        $boleto = null;

        if (isset($data['pix'])) {
            $pix = new PixQrCodeResponse(
                payload: $data['pix']['payload'] ?? '',
                encodedImage: $data['pix']['encodedImage'] ?? null,
                expiresAt: isset($data['pix']['expirationDate'])
                    ? new \DateTimeImmutable($data['pix']['expirationDate'])
                    : null,
            );
        }

        if (isset($data['bankSlipUrl']) || isset($data['nossoNumero'])) {
            $boleto = new BoletoResponse(
                barCode: $data['nossoNumero'] ?? '',
                url: $data['bankSlipUrl'] ?? null,
                digitableLine: $data['identificationField'] ?? null,
                dueDate: isset($data['dueDate'])
                    ? new \DateTimeImmutable($data['dueDate'])
                    : null,
            );
        }

        return new ChargeResponse(
            id: (string) $data['id'],
            provider: 'asaas',
            customerId: $data['customer'] ?? '',
            amountCents: (int) (($data['value'] ?? 0) * 100),
            status: $data['status'] ?? 'PENDING',
            method: self::resolvePaymentMethod($data['billingType'] ?? 'PIX'),
            checkoutUrl: $data['invoiceUrl'] ?? null,
            invoiceUrl: $data['invoiceUrl'] ?? null,
            pix: $pix,
            boleto: $boleto,
            externalReference: $data['externalReference'] ?? null,
            description: $data['description'] ?? null,
            dueDate: isset($data['dueDate'])
                ? new \DateTimeImmutable($data['dueDate'])
                : null,
            paidAt: isset($data['paymentDate'])
                ? new \DateTimeImmutable($data['paymentDate'])
                : null,
            createdAt: isset($data['dateCreated'])
                ? new \DateTimeImmutable($data['dateCreated'])
                : null,
            installments: $data['installmentCount'] ?? null,
            netValueCents: isset($data['netValue'])
                ? (int) ($data['netValue'] * 100)
                : null,
            raw: $data,
        );
    }

    /**
     * Convert Asaas API list response to ChargeCollection.
     */
    public static function toCollection(array $data): ChargeCollection
    {
        $items = array_map(
            fn (array $item) => self::fromAsaasResponse($item),
            $data['data'] ?? []
        );

        return new ChargeCollection(
            items: $items,
            total: $data['totalCount'] ?? count($items),
            perPage: $data['limit'] ?? 10,
            currentPage: isset($data['offset']) ? (int) ($data['offset'] / ($data['limit'] ?? 10)) + 1 : 1,
            hasMore: $data['hasMore'] ?? false,
        );
    }

    /**
     * Convert Asaas refund response to RefundResponse.
     */
    public static function toRefundResponse(array $data, int $originalAmountCents = 0): RefundResponse
    {
        $refundedAmount = isset($data['value'])
            ? (int) ($data['value'] * 100)
            : $originalAmountCents;

        return new RefundResponse(
            id: (string) ($data['id'] ?? ''),
            provider: 'asaas',
            refundedAmountCents: $refundedAmount,
            isPartialRefund: $originalAmountCents > 0 && $refundedAmount < $originalAmountCents,
            status: $data['status'] ?? 'REFUNDED',
            refundedAt: new \DateTimeImmutable(),
            raw: $data,
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
            default => 'PIX',
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
            default => PaymentMethod::PIX,
        };
    }
}
