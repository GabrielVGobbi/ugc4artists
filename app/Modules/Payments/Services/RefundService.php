<?php

declare(strict_types=1);

namespace App\Modules\Payments\Services;

use App\Modules\Payments\Contracts\RefundableInterface;
use App\Modules\Payments\DTO\RefundResult;
use App\Modules\Payments\Enums\PaymentStatus;
use App\Modules\Payments\Events\PaymentRefunded;
use App\Modules\Payments\Exceptions\InsufficientFundsException;
use App\Modules\Payments\Exceptions\InvalidPaymentStateException;
use App\Modules\Payments\Exceptions\PaymentException;
use App\Modules\Payments\GatewayManager;
use App\Modules\Payments\Models\Payment;
use Illuminate\Support\Facades\DB;

class RefundService
{
    public function __construct(
        private GatewayManager $gateways,
    ) {}

    public function refund(Payment $payment, ?int $amountCents = null, array $context = []): RefundResult
    {
        $amountCents ??= $payment->gateway_amount_cents;

        $this->validateRefund($payment, $amountCents);

        return DB::transaction(function () use ($payment, $amountCents, $context) {
            $payment = Payment::query()
                ->whereKey($payment->id)
                ->lockForUpdate()
                ->firstOrFail();

            $this->validateRefund($payment, $amountCents);

            $gateway = $this->gateways->driver($payment->gateway);

            if (! $gateway instanceof RefundableInterface) {
                throw new PaymentException(
                    message: "Gateway '{$payment->gateway}' não suporta reembolso.",
                    paymentUuid: $payment->uuid,
                );
            }

            $isPartialRefund = $amountCents < $payment->gateway_amount_cents;

            if ($isPartialRefund && ! $gateway->supportsPartialRefund()) {
                throw new PaymentException(
                    message: "Gateway '{$payment->gateway}' não suporta reembolso parcial.",
                    paymentUuid: $payment->uuid,
                );
            }

            $result = $gateway->refundCharge($payment, $amountCents);

            $this->updatePaymentAfterRefund($payment, $result, $context);

            $this->refundWalletAmount($payment);

            event(new PaymentRefunded(
                payment: $payment->fresh(),
                refundedAmountCents: $result->refundedAmountCents,
                isPartialRefund: $result->isPartialRefund,
                context: $context,
            ));

            return $result;
        });
    }

    public function refundWalletOnly(Payment $payment, array $context = []): void
    {
        if ($payment->wallet_applied_cents <= 0) {
            return;
        }

        DB::transaction(function () use ($payment, $context) {
            $payment = Payment::query()
                ->whereKey($payment->id)
                ->lockForUpdate()
                ->firstOrFail();

            $this->refundWalletAmount($payment);

            $payment->update([
                'status' => PaymentStatus::REFUNDED,
                'refund_at' => now(),
                'meta' => array_merge($payment->meta ?? [], [
                    'refund' => [
                        'type' => 'wallet_only',
                        'refunded_at' => now()->toISOString(),
                        'context' => $context,
                    ],
                ]),
            ]);

            event(new PaymentRefunded(
                payment: $payment->fresh(),
                refundedAmountCents: $payment->wallet_applied_cents,
                isPartialRefund: false,
                context: $context,
            ));
        });
    }

    protected function validateRefund(Payment $payment, int $amountCents): void
    {
        if ($payment->status === PaymentStatus::REFUNDED) {
            throw InvalidPaymentStateException::alreadyRefunded($payment->uuid);
        }

        if ($payment->status !== PaymentStatus::PAID) {
            throw InvalidPaymentStateException::cannotRefund($payment->status, $payment->uuid);
        }

        if ($amountCents > $payment->gateway_amount_cents) {
            throw InsufficientFundsException::forRefund(
                refundCents: $amountCents,
                receivedCents: $payment->gateway_amount_cents,
                paymentUuid: $payment->uuid,
            );
        }
    }

    protected function updatePaymentAfterRefund(
        Payment $payment,
        RefundResult $result,
        array $context,
    ): void {
        $newStatus = $result->isPartialRefund
            ? $payment->status
            : PaymentStatus::REFUNDED;

        $payment->update([
            'status' => $newStatus,
            'refund_at' => $result->isPartialRefund ? null : now(),
            'meta' => array_merge($payment->meta ?? [], [
                'refund' => [
                    'reference' => $result->reference,
                    'amount_cents' => $result->refundedAmountCents,
                    'is_partial' => $result->isPartialRefund,
                    'status' => $result->status,
                    'refunded_at' => now()->toISOString(),
                    'context' => $context,
                    'raw' => $result->raw,
                ],
            ]),
        ]);
    }

    protected function refundWalletAmount(Payment $payment): void
    {
        if ($payment->wallet_applied_cents <= 0) {
            return;
        }

        $payment->user->depositFloat($payment->wallet_applied_cents / 100, [
            'type' => 'REFUND',
            'payment_uuid' => $payment->uuid,
            'reason' => 'refund',
        ]);
    }
}
