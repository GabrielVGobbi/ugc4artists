<?php

declare(strict_types=1);

namespace App\Services\Wallet;

use App\Models\User;
use App\Modules\Payments\Enums\PaymentStatus;
use App\Modules\Payments\Models\Payment;
use Bavix\Wallet\Models\Transaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class WithdrawalService
{
    /**
     * Request a withdrawal from the creator's wallet.
     *
     * @throws ValidationException
     */
    public function requestWithdrawal(User $user, float $amount, string $pixKey, string $pixKeyType, ?string $description = null): array
    {
        $walletBalance = $user->wallet?->balanceFloat ?? 0;

        if ($amount > $walletBalance) {
            throw ValidationException::withMessages([
                'amount' => 'Saldo insuficiente para o saque solicitado.',
            ]);
        }

        $meta = [
            'type'         => 'withdrawal',
            'pix_key'      => $pixKey,
            'pix_key_type' => $pixKeyType,
            'description'  => $description ?? 'Saque via PIX',
            'status'       => 'pending',
        ];

        return DB::transaction(function () use ($user, $amount, $meta): array {
            $transaction = $user->withdraw(
                amountToDec($amount),
                $meta,
                false // unconfirmed until processed
            );

            return [
                'success'     => true,
                'transaction' => $transaction->uuid,
                'amount'      => $amount,
                'message'     => 'Saque solicitado com sucesso! O valor será transferido em até 1 dia útil.',
            ];
        });
    }

    /**
     * Get withdrawal history for a user.
     */
    public function getWithdrawalHistory(User $user, int $limit = 20): array
    {
        return Transaction::where('wallet_id', $user->wallet?->id)
            ->where('type', 'withdraw')
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get()
            ->map(fn (Transaction $tx) => [
                'id'           => $tx->uuid,
                'amount'       => abs($tx->amountFloat),
                'amountFormatted' => toCurrency(abs($tx->amountFloat)),
                'confirmed'    => $tx->confirmed,
                'status'       => $tx->confirmed ? 'completed' : 'pending',
                'statusLabel'  => $tx->confirmed ? 'Concluído' : 'Em processamento',
                'pixKey'       => $tx->meta['pix_key'] ?? null,
                'pixKeyType'   => $tx->meta['pix_key_type'] ?? null,
                'description'  => $tx->meta['description'] ?? 'Saque',
                'createdAt'    => $tx->created_at?->format('d/m/Y H:i'),
            ])
            ->toArray();
    }

    /**
     * Get earning history for a user (deposits from campaigns).
     */
    public function getEarningHistory(User $user, int $limit = 20): array
    {
        return Transaction::where('wallet_id', $user->wallet?->id)
            ->where('type', 'deposit')
            ->where('confirmed', true)
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get()
            ->map(fn (Transaction $tx) => [
                'id'             => $tx->uuid,
                'amount'         => $tx->amountFloat,
                'amountFormatted' => toCurrency($tx->amountFloat),
                'description'    => $tx->meta['description'] ?? 'Recebimento',
                'type'           => $tx->meta['type'] ?? 'other',
                'createdAt'      => $tx->created_at?->format('d/m/Y H:i'),
            ])
            ->toArray();
    }
}
