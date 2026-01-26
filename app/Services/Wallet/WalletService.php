<?php

declare(strict_types=1);

namespace App\Services\Wallet;

use App\Models\User;
use Bavix\Wallet\Models\Transaction;
use Bavix\Wallet\Services\FormatterServiceInterface;
use Brick\Math\BigDecimal;
use Brick\Math\RoundingMode;

class WalletService
{
    public function addBalanceCheckout(User $user, $cents, $attributes)
    {
        //Metodo de Pagamento (Asaas, Iugu, ETC..)
        //Customer add ou new
        //Criar Pix ou Cartão
        //Verificar se foi pago ou Não
        //Adicionar Saldo
        $this->deposit($user, $cents, $attributes);
    }

    public function deposit(User $user, $amount, ?array $meta = null): Transaction
    {
        $cents = toCents($amount);

        return $user->deposit($cents, $meta);
    }

    public function withdraw(User $user, $amount, ?array $meta = null): Transaction
    {
        $amount = amountToDec($amount);

        return $user->withdraw($amount, $meta);
    }

    public function getWalletData(User $user): array
    {
        $wallet = $user->wallet;

        $transactions = $user->transactions()
            ->orderByDesc('created_at')
            ->limit(20)
            ->get()
            ->map(fn(Transaction $tx) => [
                'id' => $tx->uuid,
                'type' => $tx->type, // deposit or withdraw
                'amount' => $tx->amount,
                'amountFloat' => $tx->amountFloat,
                'confirmed' => $tx->confirmed,
                'meta' => $tx->meta ?? [],
                'created_at' => $tx->created_at->format('c'),
            ]);

        return [
            'balance' => $wallet?->balance ?? 0,
            'balanceFloat' => $wallet?->balanceFloat ?? 0,
            'transactions' => $transactions,
        ];
    }

    public function formatCurrency(int|float $amount): string
    {
        return 'R$ ' . number_format($amount / 100, 2, ',', '.');
    }
}
