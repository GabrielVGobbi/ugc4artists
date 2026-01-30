<?php

declare(strict_types=1);

namespace App\Modules\Payments\Services;

use App\Modules\Payments\Enums\PaymentStatus;
use App\Modules\Payments\Events\PaymentCanceled;
use App\Modules\Payments\Events\PaymentFailed;
use App\Modules\Payments\Events\PaymentPaid;
use App\Modules\Payments\Exceptions\InvalidPaymentStateException;
use App\Modules\Payments\Models\Payment;
use Illuminate\Support\Facades\DB;
use Bavix\Wallet\Models\Transaction as WalletTx;

class SettlementService
{
    public function markPaid(Payment $payment, array $context = []): void
    {
        DB::transaction(function () use ($payment, $context) {
            $payment = Payment::query()
                ->whereKey($payment->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($payment->status === PaymentStatus::PAID) {
                return;
            }

            if (! $this->canTransitionToPaid($payment->status)) {
                throw InvalidPaymentStateException::cannotTransition(
                    from: $payment->status,
                    to: PaymentStatus::PAID,
                    paymentUuid: $payment->uuid,
                );
            }

            $payment->update([
                'status' => PaymentStatus::PAID,
                'paid_at' => now(),
                'meta' => array_merge($payment->meta ?? [], [
                    'settlement' => [
                        'paid_at' => now()->toISOString(),
                        'context' => $context,
                    ],
                ]),
            ]);

            $this->fulfill($payment);

            event(new PaymentPaid(
                payment: $payment->fresh(),
                context: $context,
            ));
        });
    }

    public function markFailed(Payment $payment, string $status = 'failed', array $context = []): void
    {
        DB::transaction(function () use ($payment, $status, $context) {
            $payment = Payment::query()
                ->whereKey($payment->id)
                ->lockForUpdate()
                ->firstOrFail();

            if (in_array($payment->status, [PaymentStatus::PAID, PaymentStatus::REFUNDED], true)) {
                return;
            }

            $newStatus = match ($status) {
                'canceled', 'cancelled' => PaymentStatus::CANCELED,
                default => PaymentStatus::FAILED,
            };

            $this->releaseWalletHold($payment, $newStatus);

            $payment->status = $newStatus;
            $payment->meta = array_merge($payment->meta ?? [], [
                'settlement' => [
                    'failed_at' => now()->toISOString(),
                    'reason' => $status,
                    'context' => $context,
                ],
            ]);
            $payment->save();

            $eventClass = $newStatus === PaymentStatus::CANCELED
                ? PaymentCanceled::class
                : PaymentFailed::class;

            event(new $eventClass(
                payment: $payment->fresh(),
                reason: $status,
                context: $context,
            ));
        });
    }

    public function markRequiresAction(Payment $payment, array $context = []): void
    {
        DB::transaction(function () use ($payment, $context) {
            $payment = Payment::query()
                ->whereKey($payment->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($payment->status !== PaymentStatus::PENDING) {
                return;
            }

            $payment->update([
                'status' => PaymentStatus::REQUIRES_ACTION,
                'meta' => array_merge($payment->meta ?? [], [
                    'requires_action' => [
                        'at' => now()->toISOString(),
                        'context' => $context,
                    ],
                ]),
            ]);
        });
    }

    protected function canTransitionToPaid(PaymentStatus $currentStatus): bool
    {
        return in_array($currentStatus, [
            PaymentStatus::PENDING,
            PaymentStatus::REQUIRES_ACTION,
            PaymentStatus::DRAFT,
        ], true);
    }

    protected function releaseWalletHold(Payment $payment, PaymentStatus $reason): void
    {
        if ($payment->wallet_applied_cents <= 0) {
            return;
        }

        $payment->user->depositFloat($payment->wallet_applied_cents / 100, [
            'type' => 'RELEASE',
            'payment_uuid' => $payment->uuid,
            'reason' => $reason->value,
        ]);

        $payment->hold_transaction_id = null;
    }

    protected function fulfill(Payment $payment): void
    {
        $billable = $payment->billable;

        if (! $billable) {
            return;
        }

        if ($billable instanceof WalletTx) {
            $user = $payment->user;
            // tratamento do "wallet deposit"
            // ex: olhar $payment->meta['type'] == 'wallet_deposit'
            // e executar o que precisa
            $user->confirm($billable);
            return;
        }

        if (method_exists($billable, 'onPaymentPaid')) {
            $billable->onPaymentPaid($payment);
        }
    }
}
