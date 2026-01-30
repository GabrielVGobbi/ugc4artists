<?php

declare(strict_types=1);

namespace App\Modules\Payments\Core\DTOs\Payment;

use App\Modules\Payments\Enums\PaymentMethod;
use DateTimeImmutable;

/**
 * DTO for charge/payment responses.
 */
readonly class ChargeResponse
{
    public function __construct(
        public string $id,
        public string $provider,
        public string $customerId,
        public int $amountCents,
        public string $status,
        public PaymentMethod $method,
        public ?string $checkoutUrl = null,
        public ?string $invoiceUrl = null,
        public ?PixQrCodeResponse $pix = null,
        public ?BoletoResponse $boleto = null,
        public ?string $externalReference = null,
        public ?string $description = null,
        public ?DateTimeImmutable $dueDate = null,
        public ?DateTimeImmutable $paidAt = null,
        public ?DateTimeImmutable $createdAt = null,
        public ?int $installments = null,
        public ?int $netValueCents = null,
        public array $raw = [],
        public array $requestPayload = [],
    ) {}

    /**
     * Create a copy with request payload attached.
     */
    public function withRequestPayload(array $payload): self
    {
        return new self(
            id: $this->id,
            provider: $this->provider,
            customerId: $this->customerId,
            amountCents: $this->amountCents,
            status: $this->status,
            method: $this->method,
            checkoutUrl: $this->checkoutUrl,
            invoiceUrl: $this->invoiceUrl,
            pix: $this->pix,
            boleto: $this->boleto,
            externalReference: $this->externalReference,
            description: $this->description,
            dueDate: $this->dueDate,
            paidAt: $this->paidAt,
            createdAt: $this->createdAt,
            installments: $this->installments,
            netValueCents: $this->netValueCents,
            raw: $this->raw,
            requestPayload: $payload,
        );
    }

    public static function fromArray(array $data, string $provider = ''): self
    {
        return new self(
            id: (string) $data['id'],
            provider: $provider,
            customerId: $data['customer'] ?? $data['customer_id'] ?? $data['customerId'] ?? '',
            amountCents: isset($data['value'])
                ? (int) ($data['value'] * 100)
                : (int) ($data['amount_cents'] ?? $data['total_cents'] ?? 0),
            status: $data['status'] ?? 'unknown',
            method: self::resolvePaymentMethod($data),
            checkoutUrl: $data['invoiceUrl'] ?? $data['secure_url'] ?? $data['checkout_url'] ?? null,
            invoiceUrl: $data['invoiceUrl'] ?? $data['secure_url'] ?? null,
            pix: isset($data['pix']) ? PixQrCodeResponse::fromArray($data['pix']) : null,
            boleto: isset($data['bankSlipUrl']) || isset($data['bank_slip_url'])
                ? BoletoResponse::fromArray($data)
                : null,
            externalReference: $data['externalReference'] ?? $data['external_reference'] ?? null,
            description: $data['description'] ?? null,
            dueDate: isset($data['dueDate']) || isset($data['due_date'])
                ? new DateTimeImmutable($data['dueDate'] ?? $data['due_date'])
                : null,
            paidAt: isset($data['paymentDate']) || isset($data['paid_at'])
                ? new DateTimeImmutable($data['paymentDate'] ?? $data['paid_at'])
                : null,
            createdAt: isset($data['dateCreated']) || isset($data['created_at'])
                ? new DateTimeImmutable($data['dateCreated'] ?? $data['created_at'])
                : null,
            installments: $data['installmentCount'] ?? $data['installments'] ?? null,
            netValueCents: isset($data['netValue'])
                ? (int) ($data['netValue'] * 100)
                : ($data['net_value_cents'] ?? null),
            raw: $data,
        );
    }

    private static function resolvePaymentMethod(array $data): PaymentMethod
    {
        $methodValue = $data['billingType'] ?? $data['payable_with'] ?? $data['method'] ?? 'PIX';

        return match (strtoupper($methodValue)) {
            'PIX' => PaymentMethod::PIX,
            'CREDIT_CARD', 'CREDIT-CARD', 'CREDITCARD' => PaymentMethod::CREDIT_CARD,
            'BOLETO', 'BANK_SLIP', 'BANKSLIP' => PaymentMethod::BOLETO,
            default => PaymentMethod::PIX,
        };
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'provider' => $this->provider,
            'customer_id' => $this->customerId,
            'amount_cents' => $this->amountCents,
            'status' => $this->status,
            'method' => $this->method->value,
            'checkout_url' => $this->checkoutUrl,
            'invoice_url' => $this->invoiceUrl,
            'pix' => $this->pix?->toArray(),
            'boleto' => $this->boleto?->toArray(),
            'external_reference' => $this->externalReference,
            'description' => $this->description,
            'due_date' => $this->dueDate?->format('Y-m-d'),
            'paid_at' => $this->paidAt?->format('Y-m-d H:i:s'),
            'created_at' => $this->createdAt?->format('Y-m-d H:i:s'),
            'installments' => $this->installments,
            'net_value_cents' => $this->netValueCents,
            'request_payload' => $this->requestPayload,
        ];
    }
}
