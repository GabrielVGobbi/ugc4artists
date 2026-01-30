<?php

declare(strict_types=1);

namespace App\Modules\Payments\Core\DTOs\Transfer;

/**
 * DTO for bank account data in transfer responses.
 */
readonly class BankAccountResponse
{
    public function __construct(
        public string $bank,
        public string $bankName,
        public string $ownerName,
        public string $document,
        public string $agency,
        public string $account,
        public ?string $accountDigit = null,
        public ?string $agencyDigit = null,
        public string $accountType = 'CHECKING',
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            bank: $data['bank']['code'] ?? $data['bank'] ?? $data['bankCode'] ?? '',
            bankName: $data['bank']['name'] ?? $data['bankName'] ?? '',
            ownerName: $data['ownerName'] ?? $data['owner_name'] ?? $data['name'] ?? '',
            document: $data['cpfCnpj'] ?? $data['document'] ?? '',
            agency: $data['agency'] ?? '',
            account: $data['account'] ?? '',
            accountDigit: $data['accountDigit'] ?? $data['account_digit'] ?? null,
            agencyDigit: $data['agencyDigit'] ?? $data['agency_digit'] ?? null,
            accountType: strtoupper($data['bankAccountType'] ?? $data['account_type'] ?? 'CHECKING'),
        );
    }

    public function toArray(): array
    {
        return [
            'bank' => $this->bank,
            'bank_name' => $this->bankName,
            'owner_name' => $this->ownerName,
            'document' => $this->document,
            'agency' => $this->agency,
            'account' => $this->account,
            'account_digit' => $this->accountDigit,
            'agency_digit' => $this->agencyDigit,
            'account_type' => $this->accountType,
        ];
    }
}
