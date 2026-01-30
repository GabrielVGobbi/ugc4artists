<?php

declare(strict_types=1);

namespace App\Modules\Payments\Core\DTOs\Transfer;

/**
 * DTO for bank account data in transfer requests.
 */
readonly class BankAccountRequest
{
    public function __construct(
        public string $bank,
        public string $accountName,
        public string $ownerName,
        public string $document,
        public string $agency,
        public string $account,
        public ?string $accountDigit = null,
        public ?string $agencyDigit = null,
        public string $accountType = 'CHECKING',
        public string $personType = 'FISICA',
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            bank: $data['bank'] ?? $data['bankCode'] ?? '',
            accountName: $data['account_name'] ?? $data['accountName'] ?? '',
            ownerName: $data['owner_name'] ?? $data['ownerName'] ?? $data['name'] ?? '',
            document: $data['document'] ?? $data['cpfCnpj'] ?? $data['cpf_cnpj'] ?? '',
            agency: $data['agency'] ?? '',
            account: $data['account'] ?? '',
            accountDigit: $data['account_digit'] ?? $data['accountDigit'] ?? null,
            agencyDigit: $data['agency_digit'] ?? $data['agencyDigit'] ?? null,
            accountType: strtoupper($data['account_type'] ?? $data['accountType'] ?? $data['bankAccountType'] ?? 'CHECKING'),
            personType: strtoupper($data['person_type'] ?? $data['personType'] ?? $data['ownerBirthDate'] ?? 'FISICA'),
        );
    }

    public function toArray(): array
    {
        return array_filter([
            'bank' => $this->bank,
            'account_name' => $this->accountName,
            'owner_name' => $this->ownerName,
            'document' => $this->document,
            'agency' => $this->agency,
            'account' => $this->account,
            'account_digit' => $this->accountDigit,
            'agency_digit' => $this->agencyDigit,
            'account_type' => $this->accountType,
            'person_type' => $this->personType,
        ], fn ($value) => $value !== null);
    }
}
