<?php

declare(strict_types=1);

namespace App\Modules\Payments\Core\DTOs\Transfer;

use DateTimeInterface;

/**
 * DTO for transfer/payout creation requests.
 */
readonly class TransferRequest
{
    public function __construct(
        public int $amountCents,
        public ?string $walletId = null,
        public ?BankAccountRequest $bankAccount = null,
        public ?string $pixKey = null,
        public string $type = 'PIX',
        public ?DateTimeInterface $scheduleDate = null,
        public ?string $description = null,
        public ?string $externalReference = null,
        public array $meta = [],
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            amountCents: (int) ($data['amount_cents'] ?? $data['amountCents'] ?? ($data['value'] ?? 0) * 100),
            walletId: $data['wallet_id'] ?? $data['walletId'] ?? null,
            bankAccount: isset($data['bank_account']) || isset($data['bankAccount'])
                ? BankAccountRequest::fromArray($data['bank_account'] ?? $data['bankAccount'])
                : null,
            pixKey: $data['pix_key'] ?? $data['pixKey'] ?? $data['pixAddressKey'] ?? null,
            type: strtoupper($data['type'] ?? $data['operationType'] ?? 'PIX'),
            scheduleDate: isset($data['schedule_date']) || isset($data['scheduleDate'])
                ? new \DateTimeImmutable($data['schedule_date'] ?? $data['scheduleDate'])
                : null,
            description: $data['description'] ?? null,
            externalReference: $data['external_reference'] ?? $data['externalReference'] ?? null,
            meta: $data['meta'] ?? [],
        );
    }

    public function toArray(): array
    {
        return array_filter([
            'amount_cents' => $this->amountCents,
            'wallet_id' => $this->walletId,
            'bank_account' => $this->bankAccount?->toArray(),
            'pix_key' => $this->pixKey,
            'type' => $this->type,
            'schedule_date' => $this->scheduleDate?->format('Y-m-d'),
            'description' => $this->description,
            'external_reference' => $this->externalReference,
            'meta' => $this->meta,
        ], fn ($value) => $value !== null && $value !== []);
    }
}
