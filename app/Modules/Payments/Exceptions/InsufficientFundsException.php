<?php

declare(strict_types=1);

namespace App\Modules\Payments\Exceptions;

use Throwable;

class InsufficientFundsException extends PaymentException
{
    public function __construct(
        string $message = 'Saldo insuficiente para realizar a operação.',
        int $code = 422,
        ?Throwable $previous = null,
        ?string $paymentUuid = null,
        public readonly ?int $requiredAmountCents = null,
        public readonly ?int $availableAmountCents = null,
        array $context = [],
    ) {
        parent::__construct($message, $code, $previous, $paymentUuid, $context);
    }

    public function getContext(): array
    {
        return array_merge(parent::getContext(), [
            'required_amount_cents' => $this->requiredAmountCents,
            'available_amount_cents' => $this->availableAmountCents,
            'shortage_cents' => $this->requiredAmountCents && $this->availableAmountCents
                ? $this->requiredAmountCents - $this->availableAmountCents
                : null,
        ]);
    }

    public static function forWallet(
        int $requiredCents,
        int $availableCents,
        ?string $paymentUuid = null,
    ): self {
        $requiredFormatted = number_format($requiredCents / 100, 2, ',', '.');
        $availableFormatted = number_format($availableCents / 100, 2, ',', '.');

        return new self(
            message: "Saldo insuficiente na carteira. Necessário: R$ {$requiredFormatted}, Disponível: R$ {$availableFormatted}.",
            paymentUuid: $paymentUuid,
            requiredAmountCents: $requiredCents,
            availableAmountCents: $availableCents,
        );
    }

    public static function forRefund(
        int $refundCents,
        int $receivedCents,
        ?string $paymentUuid = null,
    ): self {
        return new self(
            message: 'O valor do reembolso excede o valor recebido no pagamento.',
            paymentUuid: $paymentUuid,
            requiredAmountCents: $refundCents,
            availableAmountCents: $receivedCents,
        );
    }
}
