<?php

declare(strict_types=1);

namespace App\Modules\Payments\Gateways\Asaas\Mappers;

use App\Modules\Payments\Core\DTOs\Transfer\BankAccountResponse;
use App\Modules\Payments\Core\DTOs\Transfer\TransferCollection;
use App\Modules\Payments\Core\DTOs\Transfer\TransferRequest;
use App\Modules\Payments\Core\DTOs\Transfer\TransferResponse;

/**
 * Mapper for converting between generic DTOs and Asaas-specific format.
 */
final class TransferMapper
{
    /**
     * Convert TransferRequest to Asaas API payload.
     */
    public static function toAsaasPayload(TransferRequest $request): array
    {
        $payload = [
            'value' => $request->amountCents / 100,
        ];

        // Determine operation type
        if ($request->walletId) {
            $payload['walletId'] = $request->walletId;
        } elseif ($request->pixKey) {
            $payload['pixAddressKey'] = $request->pixKey;
            $payload['pixAddressKeyType'] = self::detectPixKeyType($request->pixKey);
        } elseif ($request->bankAccount) {
            $payload['bankAccount'] = [
                'bank' => ['code' => $request->bankAccount->bank],
                'accountName' => $request->bankAccount->accountName,
                'ownerName' => $request->bankAccount->ownerName,
                'cpfCnpj' => preg_replace('/\D/', '', $request->bankAccount->document),
                'agency' => $request->bankAccount->agency,
                'agencyDigit' => $request->bankAccount->agencyDigit,
                'account' => $request->bankAccount->account,
                'accountDigit' => $request->bankAccount->accountDigit,
                'bankAccountType' => self::mapAccountType($request->bankAccount->accountType),
            ];
        }

        if ($request->scheduleDate) {
            $payload['scheduleDate'] = $request->scheduleDate->format('Y-m-d');
        }

        if ($request->description) {
            $payload['description'] = $request->description;
        }

        if ($request->externalReference) {
            $payload['externalReference'] = $request->externalReference;
        }

        return $payload;
    }

    /**
     * Convert Asaas API response to TransferResponse.
     */
    public static function fromAsaasResponse(array $data): TransferResponse
    {
        $bankAccount = null;

        if (isset($data['bankAccount'])) {
            $bankAccount = new BankAccountResponse(
                bank: $data['bankAccount']['bank']['code'] ?? '',
                bankName: $data['bankAccount']['bank']['name'] ?? '',
                ownerName: $data['bankAccount']['ownerName'] ?? '',
                document: $data['bankAccount']['cpfCnpj'] ?? '',
                agency: $data['bankAccount']['agency'] ?? '',
                account: $data['bankAccount']['account'] ?? '',
                accountDigit: $data['bankAccount']['accountDigit'] ?? null,
                agencyDigit: $data['bankAccount']['agencyDigit'] ?? null,
                accountType: $data['bankAccount']['bankAccountType'] ?? 'CHECKING',
            );
        }

        return new TransferResponse(
            id: (string) $data['id'],
            provider: 'asaas',
            amountCents: (int) (($data['value'] ?? 0) * 100),
            status: $data['status'] ?? 'PENDING',
            type: $data['operationType'] ?? ($data['pixAddressKey'] ? 'PIX' : ($data['walletId'] ? 'ASAAS' : 'TED')),
            walletId: $data['walletId'] ?? null,
            pixKey: $data['pixAddressKey'] ?? null,
            bankAccount: $bankAccount,
            scheduleDate: isset($data['scheduleDate'])
                ? new \DateTimeImmutable($data['scheduleDate'])
                : null,
            transferDate: isset($data['transferDate'])
                ? new \DateTimeImmutable($data['transferDate'])
                : null,
            createdAt: isset($data['dateCreated'])
                ? new \DateTimeImmutable($data['dateCreated'])
                : null,
            transactionReceiptUrl: $data['transactionReceiptUrl'] ?? null,
            failReason: $data['failReason'] ?? null,
            raw: $data,
        );
    }

    /**
     * Convert Asaas API list response to TransferCollection.
     */
    public static function toCollection(array $data): TransferCollection
    {
        $items = array_map(
            fn (array $item) => self::fromAsaasResponse($item),
            $data['data'] ?? []
        );

        return new TransferCollection(
            items: $items,
            total: $data['totalCount'] ?? count($items),
            perPage: $data['limit'] ?? 10,
            currentPage: isset($data['offset']) ? (int) ($data['offset'] / ($data['limit'] ?? 10)) + 1 : 1,
            hasMore: $data['hasMore'] ?? false,
        );
    }

    /**
     * Detect PIX key type from key value.
     */
    public static function detectPixKeyType(string $pixKey): string
    {
        // CPF: 11 digits
        if (preg_match('/^\d{11}$/', preg_replace('/\D/', '', $pixKey))) {
            return 'CPF';
        }

        // CNPJ: 14 digits
        if (preg_match('/^\d{14}$/', preg_replace('/\D/', '', $pixKey))) {
            return 'CNPJ';
        }

        // Email
        if (filter_var($pixKey, FILTER_VALIDATE_EMAIL)) {
            return 'EMAIL';
        }

        // Phone (with country code)
        if (preg_match('/^\+?55\d{10,11}$/', preg_replace('/\D/', '', $pixKey))) {
            return 'PHONE';
        }

        // Random key (EVP)
        return 'EVP';
    }

    /**
     * Map account type to Asaas format.
     */
    public static function mapAccountType(string $type): string
    {
        return match (strtoupper($type)) {
            'CHECKING', 'CONTA_CORRENTE' => 'CONTA_CORRENTE',
            'SAVINGS', 'POUPANCA', 'CONTA_POUPANCA' => 'CONTA_POUPANCA',
            default => 'CONTA_CORRENTE',
        };
    }
}
