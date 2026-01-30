<?php

declare(strict_types=1);

namespace App\Modules\Payments\Core\DTOs\Transfer;

use DateTimeImmutable;

/**
 * DTO for transfer/payout responses.
 */
readonly class TransferResponse
{
    public function __construct(
        public string $id,
        public string $provider,
        public int $amountCents,
        public string $status,
        public string $type,
        public ?string $walletId = null,
        public ?string $pixKey = null,
        public ?BankAccountResponse $bankAccount = null,
        public ?DateTimeImmutable $scheduleDate = null,
        public ?DateTimeImmutable $transferDate = null,
        public ?DateTimeImmutable $createdAt = null,
        public ?string $transactionReceiptUrl = null,
        public ?string $failReason = null,
        public array $raw = [],
    ) {}

    public static function fromArray(array $data, string $provider = ''): self
    {
        return new self(
            id: (string) $data['id'],
            provider: $provider,
            amountCents: isset($data['value'])
                ? (int) ($data['value'] * 100)
                : (int) ($data['amount_cents'] ?? 0),
            status: $data['status'] ?? 'unknown',
            type: strtoupper($data['type'] ?? $data['operationType'] ?? 'PIX'),
            walletId: $data['walletId'] ?? $data['wallet_id'] ?? null,
            pixKey: $data['pixAddressKey'] ?? $data['pix_key'] ?? null,
            bankAccount: isset($data['bankAccount']) || isset($data['bank_account'])
                ? BankAccountResponse::fromArray($data['bankAccount'] ?? $data['bank_account'])
                : null,
            scheduleDate: isset($data['scheduleDate']) || isset($data['schedule_date'])
                ? new DateTimeImmutable($data['scheduleDate'] ?? $data['schedule_date'])
                : null,
            transferDate: isset($data['transferDate']) || isset($data['transfer_date'])
                ? new DateTimeImmutable($data['transferDate'] ?? $data['transfer_date'])
                : null,
            createdAt: isset($data['dateCreated']) || isset($data['created_at'])
                ? new DateTimeImmutable($data['dateCreated'] ?? $data['created_at'])
                : null,
            transactionReceiptUrl: $data['transactionReceiptUrl'] ?? $data['receipt_url'] ?? null,
            failReason: $data['failReason'] ?? $data['fail_reason'] ?? null,
            raw: $data,
        );
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'provider' => $this->provider,
            'amount_cents' => $this->amountCents,
            'status' => $this->status,
            'type' => $this->type,
            'wallet_id' => $this->walletId,
            'pix_key' => $this->pixKey,
            'bank_account' => $this->bankAccount?->toArray(),
            'schedule_date' => $this->scheduleDate?->format('Y-m-d'),
            'transfer_date' => $this->transferDate?->format('Y-m-d'),
            'created_at' => $this->createdAt?->format('Y-m-d H:i:s'),
            'receipt_url' => $this->transactionReceiptUrl,
            'fail_reason' => $this->failReason,
        ];
    }
}
