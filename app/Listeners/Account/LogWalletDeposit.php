<?php

declare(strict_types=1);

namespace App\Listeners\Account;

use App\Models\AccountStatement;
use App\Modules\Payments\Events\PaymentPaid;
use Bavix\Wallet\Models\Transaction as WalletTransaction;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;

/**
 * Creates AccountStatement entry when a wallet deposit is confirmed.
 *
 * Listens to PaymentPaid event and checks if the billable is a WalletTransaction.
 * If yes, creates a deposit entry in the account statement.
 */
class LogWalletDeposit implements ShouldQueue
{
    /**
     * Handle the event.
     */
    public function handle(PaymentPaid $event): void
    {
        $payment = $event->payment;

        // Verificar se é um depósito de carteira
        if (!($payment->billable instanceof WalletTransaction)) {
            return;
        }

        // Verificar se já existe um statement para este payment
        $exists = AccountStatement::where('payment_id', $payment->uuid)
            ->where('type', 'deposit')
            ->exists();

        if ($exists) {
            Log::info('AccountStatement for wallet deposit already exists', [
                'payment_uuid' => $payment->uuid,
            ]);
            return;
        }

        try {
            AccountStatement::create([
                'user_id' => $payment->user_id,
                'statementable_type' => WalletTransaction::class,
                'statementable_id' => $payment->billable_id,
                'type' => 'deposit',
                'category' => 'wallet_deposit',
                'amount' => $payment->amount_cents / 100, // Positivo (entrada)
                'wallet_amount' => $payment->amount_cents / 100,
                'gateway_amount' => 0,
                'payment_method' => $payment->payment_method,
                'gateway' => $payment->gateway,
                'payment_id' => $payment->uuid,
                'status' => 'completed',
                'description' => $this->buildDescription($payment),
                'meta' => [
                    'payment_uuid' => $payment->uuid,
                    'transaction_id' => $payment->billable_id,
                    'amount_cents' => $payment->amount_cents,
                ],
                'completed_at' => now(),
            ]);

            Log::info('Wallet deposit logged in AccountStatement', [
                'payment_uuid' => $payment->uuid,
                'user_id' => $payment->user_id,
                'amount' => $payment->amount_cents / 100,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to log wallet deposit in AccountStatement', [
                'payment_uuid' => $payment->uuid,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Build description for the deposit.
     */
    protected function buildDescription(mixed $payment): string
    {
        $methodValue = $payment->payment_method instanceof \App\Modules\Payments\Enums\PaymentMethod
            ? $payment->payment_method->value
            : (string) $payment->payment_method;

        $method = match ($methodValue) {
            'pix' => 'PIX',
            'credit_card', 'card' => 'Cartão de Crédito',
            default => ucfirst($methodValue ?: 'Pagamento'),
        };

        return "Depósito via {$method}";
    }
}
