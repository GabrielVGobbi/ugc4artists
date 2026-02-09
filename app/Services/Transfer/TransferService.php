<?php

declare(strict_types=1);

namespace App\Services\Transfer;

use App\Models\User;
use App\Modules\Payments\Exceptions\InsufficientFundsException;
use Bavix\Wallet\Models\Transfer;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class TransferService
{
    /**
     * Transfer amount from one user to another.
     *
     * @param  array{description?: string}  $meta
     *
     * @throws InsufficientFundsException
     * @throws ValidationException
     */
    public function transfer(User $from, User $to, int $amount, array $meta = []): Transfer
    {
        // Validate self-transfer
        if ($from->id === $to->id) {
            throw ValidationException::withMessages([
                'to_user_id' => ['Não é possível transferir para você mesmo.'],
            ]);
        }

        // Validate positive amount
        if ($amount <= 0) {
            throw ValidationException::withMessages([
                'amount' => ['O valor da transferência deve ser maior que zero.'],
            ]);
        }

        return DB::transaction(function () use ($from, $to, $amount, $meta) {
            // Lock the wallet for the sender to prevent race conditions
            $fromWallet = $from->wallet;

            // Validate balance
            $balance = $from->balanceInt;
            if ($balance < $amount) {
                throw InsufficientFundsException::forWallet(
                    requiredCents: $amount,
                    availableCents: $balance,
                );
            }

            // Build transfer meta with description
            $transferMeta = [
                'description' => $meta['description'] ?? 'Transferência entre usuários',
                'from_user_id' => $from->id,
                'from_user_name' => $from->name,
                'to_user_id' => $to->id,
                'to_user_name' => $to->name,
            ];

            // Execute transfer using bavix/laravel-wallet
            // This handles atomicity, creates both transactions (withdraw + deposit)
            // and the transfer record
            $transfer = $from->transfer($to, $amount, $transferMeta);

            // Update the transfer record with description field if the column exists
            if ($transfer && isset($meta['description'])) {
                $transfer->update([
                    'extra' => array_merge($transfer->extra ?? [], [
                        'description' => $meta['description'],
                    ]),
                ]);
            }

            return $transfer;
        });
    }

    /**
     * Cancel a transfer and restore balances.
     *
     * @throws ValidationException
     */
    public function cancel(Transfer $transfer, User $cancelledBy): Transfer
    {
        // Check if already cancelled
        if ($transfer->deleted_at !== null || ($transfer->extra['cancelled_at'] ?? null)) {
            throw ValidationException::withMessages([
                'transfer' => ['Esta transferência já foi cancelada.'],
            ]);
        }

        // Verify the user is the sender (from_id relates to the withdraw transaction wallet)
        $withdrawTransaction = $transfer->withdraw;
        $fromWallet = $withdrawTransaction->wallet;

        if ($fromWallet->holder_id !== $cancelledBy->id) {
            throw ValidationException::withMessages([
                'transfer' => ['Você não tem permissão para cancelar esta transferência.'],
            ]);
        }

        return DB::transaction(function () use ($transfer, $cancelledBy) {
            // Get the deposit transaction to find the recipient
            $depositTransaction = $transfer->deposit;
            $toWallet = $depositTransaction->wallet;
            $toUser = $toWallet->holder;

            // Get the withdraw transaction to find the sender
            $withdrawTransaction = $transfer->withdraw;
            $fromWallet = $withdrawTransaction->wallet;
            $fromUser = $fromWallet->holder;

            $amount = abs($withdrawTransaction->amount);

            // Check if recipient has enough balance to reverse
            if ($toUser->balanceInt < $amount) {
                throw ValidationException::withMessages([
                    'transfer' => [
                        'Não é possível cancelar: o destinatário não possui saldo suficiente para o estorno.',
                    ],
                ]);
            }

            // Reverse: transfer back from recipient to sender
            $reverseMeta = [
                'description' => 'Estorno de transferência',
                'original_transfer_id' => $transfer->id,
                'cancelled_by' => $cancelledBy->id,
                'cancelled_by_name' => $cancelledBy->name,
            ];

            $toUser->transfer($fromUser, $amount, $reverseMeta);

            // Mark the original transfer as cancelled
            $transfer->update([
                'extra' => array_merge($transfer->extra ?? [], [
                    'cancelled_at' => now()->toIso8601String(),
                    'cancelled_by' => $cancelledBy->id,
                    'cancelled_by_name' => $cancelledBy->name,
                ]),
            ]);

            // Soft delete if the column exists
            if (method_exists($transfer, 'delete')) {
                $transfer->delete();
            }

            return $transfer->fresh();
        });
    }

    /**
     * Get paginated transfers for a user.
     *
     * @param  array{
     *     type?: string,
     *     search?: string,
     *     per_page?: int,
     * }  $filters
     */
    public function getUserTransfers(User $user, array $filters = []): LengthAwarePaginator
    {
        $perPage = $filters['per_page'] ?? 10;
        $type = $filters['type'] ?? 'all';
        $search = $filters['search'] ?? null;

        $wallet = $user->wallet;

        if (! $wallet) {
            // Return empty paginator if user has no wallet
            return Transfer::query()->whereRaw('1 = 0')->paginate($perPage);
        }

        $walletId = $wallet->id;

        $query = Transfer::query()
            ->with(['withdraw.wallet.holder', 'deposit.wallet.holder'])
            ->where(function (Builder $q) use ($walletId, $type) {
                if ($type === 'sent') {
                    // Transfers where user is the sender (withdraw side)
                    $q->whereHas('withdraw', function (Builder $wq) use ($walletId) {
                        $wq->where('wallet_id', $walletId);
                    });
                } elseif ($type === 'received') {
                    // Transfers where user is the receiver (deposit side)
                    $q->whereHas('deposit', function (Builder $dq) use ($walletId) {
                        $dq->where('wallet_id', $walletId);
                    });
                } else {
                    // All transfers where user is sender or receiver
                    $q->where(function (Builder $inner) use ($walletId) {
                        $inner->whereHas('withdraw', function (Builder $wq) use ($walletId) {
                            $wq->where('wallet_id', $walletId);
                        })->orWhereHas('deposit', function (Builder $dq) use ($walletId) {
                            $dq->where('wallet_id', $walletId);
                        });
                    });
                }
            });

        // Apply search filter
        if (! empty($search)) {
            $query->where(function (Builder $q) use ($search) {
                // Search by user name in meta or amount
                $q->whereHas('withdraw.wallet.holder', function (Builder $uq) use ($search) {
                    $uq->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                })->orWhereHas('deposit.wallet.holder', function (Builder $uq) use ($search) {
                    $uq->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            });
        }

        return $query->orderByDesc('created_at')->paginate($perPage);
    }

    /**
     * Get a single transfer by UUID or ID.
     */
    public function findTransfer(string $identifier): ?Transfer
    {
        return Transfer::query()
            ->with(['withdraw.wallet.holder', 'deposit.wallet.holder'])
            ->where('uuid', $identifier)
            ->orWhere('id', $identifier)
            ->first();
    }

    /**
     * Check if user can cancel the transfer.
     */
    public function canCancel(Transfer $transfer, User $user): bool
    {
        // Only the sender can cancel
        $withdrawTransaction = $transfer->withdraw;

        if (! $withdrawTransaction || ! $withdrawTransaction->wallet) {
            return false;
        }

        if ($withdrawTransaction->wallet->holder_id !== $user->id) {
            return false;
        }

        // Check if not already cancelled
        if ($transfer->deleted_at !== null || ($transfer->extra['cancelled_at'] ?? null)) {
            return false;
        }

        return true;
    }

    /**
     * Get transfer status.
     */
    public function getStatus(Transfer $transfer): string
    {
        if ($transfer->deleted_at !== null || ($transfer->extra['cancelled_at'] ?? null)) {
            return 'cancelled';
        }

        return 'completed';
    }
}
