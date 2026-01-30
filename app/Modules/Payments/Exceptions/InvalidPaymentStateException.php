<?php

declare(strict_types=1);

namespace App\Modules\Payments\Exceptions;

use App\Modules\Payments\Enums\PaymentStatus;
use Throwable;

class InvalidPaymentStateException extends PaymentException
{
    public function __construct(
        string $message = 'Transição de estado inválida para o pagamento.',
        int $code = 422,
        ?Throwable $previous = null,
        ?string $paymentUuid = null,
        public readonly ?PaymentStatus $currentStatus = null,
        public readonly ?PaymentStatus $targetStatus = null,
        array $context = [],
    ) {
        parent::__construct($message, $code, $previous, $paymentUuid, $context);
    }

    public function getContext(): array
    {
        return array_merge(parent::getContext(), [
            'current_status' => $this->currentStatus?->value,
            'target_status' => $this->targetStatus?->value,
        ]);
    }

    public static function cannotTransition(
        PaymentStatus $from,
        PaymentStatus $to,
        ?string $paymentUuid = null,
    ): self {
        return new self(
            message: "Não é possível alterar o status do pagamento de '{$from->value}' para '{$to->value}'.",
            paymentUuid: $paymentUuid,
            currentStatus: $from,
            targetStatus: $to,
        );
    }

    public static function alreadyPaid(?string $paymentUuid = null): self
    {
        return new self(
            message: 'O pagamento já foi confirmado.',
            paymentUuid: $paymentUuid,
            currentStatus: PaymentStatus::PAID,
        );
    }

    public static function alreadyRefunded(?string $paymentUuid = null): self
    {
        return new self(
            message: 'O pagamento já foi reembolsado.',
            paymentUuid: $paymentUuid,
            currentStatus: PaymentStatus::REFUNDED,
        );
    }

    public static function cannotRefund(PaymentStatus $currentStatus, ?string $paymentUuid = null): self
    {
        return new self(
            message: "Não é possível reembolsar um pagamento com status '{$currentStatus->value}'.",
            paymentUuid: $paymentUuid,
            currentStatus: $currentStatus,
            targetStatus: PaymentStatus::REFUNDED,
        );
    }
}
