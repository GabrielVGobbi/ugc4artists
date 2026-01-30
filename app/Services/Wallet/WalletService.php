<?php

declare(strict_types=1);

namespace App\Services\Wallet;

use App\Models\User;
use App\Modules\Payments\Checkout\CheckoutResult;
use App\Modules\Payments\Core\DTOs\Shared\AddressRequest;
use App\Modules\Payments\Enums\PaymentMethod;
use App\Modules\Payments\Enums\PaymentStatus;
use App\Modules\Payments\Facades\Checkout;
use App\Modules\Payments\Facades\Gateway;
use App\Modules\Payments\Models\Payment;
use App\Modules\Payments\Models\WalletTransaction;
use Bavix\Wallet\Models\Transaction;
use Bavix\Wallet\Models\Wallet;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class WalletService
{
    /**
     * Add balance to user's wallet via payment checkout.
     *
     * @param  array{
     *     payment_method: string,
     *     name?: string,
     *     cpf?: string,
     *     address?: string,
     *     card_number?: string,
     *     card_expiry?: string,
     *     card_cvv?: string,
     *     card_holder_name?: string,
     *     card_holder_email?: string,
     *     card_holder_document?: string,
     *     card_holder_postal_code?: string,
     *     card_holder_address_number?: string,
     *     card_holder_phone?: string,
     * }  $payload
     */
    public function addBalanceCheckout(User $user, $cents, array $payload = []): CheckoutResult
    {
        // Idempotency: check if there's an existing pending payment for the same amount
        $existingPayment = $this->findExistingPendingPayment($user, $cents);

        if ($existingPayment) {
            return $this->buildCheckoutResultFromExisting($existingPayment);
        }

        return DB::transaction(function () use ($user, $cents, $payload) {

            $meta =  [
                'description' => 'Depósito via ' . ($payload['payment_method'] === 'pix' ? 'PIX' : 'Cartão de Crédito'),
            ];

            $transaction = $this->deposit($user, $cents, $meta, false);

            $paymentMethod = $this->resolvePaymentMethod($payload['payment_method'] ?? 'pix');

            // Build checkout
            $checkout = Checkout::for($user)
                ->billable($transaction)
                ->amount($cents * 100)
                ->method($paymentMethod)
                ->gateway('asaas')
                ->useWallet(false) // Don't use wallet balance for deposit
                ->description('Depósito na carteira')
                ->meta([
                    'type' => 'wallet_deposit',
                    'name' => $user->name ?? null,
                    'document' => $user->document ?? null,
                ]);

            // If credit card, add card data
            if ($paymentMethod === PaymentMethod::CREDIT_CARD) {
                $checkout = $this->addCreditCardData($checkout, $payload);
            }

            return $checkout->create();
        });
    }

    /**
     * Find existing pending payment for idempotency.
     */
    protected function findExistingPendingPayment(User $user, $cents): ?Payment
    {
        return Payment::where('user_id', $user->id)
            ->where('billable_type', Transaction::class)
            ->where('amount_cents', $cents * 100)
            ->where('status', PaymentStatus::PENDING)
            ->where('created_at', '>=', now()->subMinutes(4))
            ->orderByDesc('created_at')
            ->first();
    }

    /**
     * Build CheckoutResult from existing payment.
     */
    protected function buildCheckoutResultFromExisting(Payment $payment): CheckoutResult
    {
        // Check if payment status changed
        if ($payment->gateway_reference) {
            $gatewayStatus = Gateway::driver($payment->gateway)
                ->payments()
                ->getStatus($payment->gateway_reference);

            // Update local status if needed
            if ($gatewayStatus && $this->shouldUpdateStatus($payment, $gatewayStatus)) {
                $payment->update(['status' => $this->mapGatewayStatus($gatewayStatus)]);
                $payment->refresh();
            }
        }

        // Build result based on payment method
        if ($payment->payment_method === PaymentMethod::PIX) {
            $pixData = $payment->meta['gateway']['qr_code_payload'] ?? null;

            if ($pixData) {
                $pix = new \App\Modules\Payments\Core\DTOs\Payment\PixQrCodeResponse(
                    payload: $pixData,
                    encodedImage: $payment->meta['gateway']['qr_code_image'] ?? null,
                );

                return CheckoutResult::pendingPix($payment, $pix, $payment->url);
            }
        }

        if ($payment->status === PaymentStatus::PAID) {
            return CheckoutResult::paidWithWallet($payment);
        }

        return CheckoutResult::pending($payment, $payment->url);
    }

    /**
     * Add credit card data to checkout.
     */
    protected function addCreditCardData($checkout, array $payload)
    {
        // Parse card expiry (MM/YY or MM/YYYY)
        $expiry = $payload['card_expiry'] ?? '';
        [$expiryMonth, $expiryYear] = $this->parseCardExpiry($expiry);

        $holder = $checkout->getHolder();
        $addressData = $holder->defaultAddress();

        throw_if(
            !$addressData,
            ValidationException::class,
            ValidationException::withMessages(['address' => 'Não foi possivel localizar o endereço'])
        );

        $address = AddressRequest::fromArray($addressData->toArray());

        $cardHolderName = $payload['card_holder_name'] ?? $payload['name'] ?? '';
        if (str_word_count($cardHolderName) < 2) {
            throw ValidationException::withMessages([
                'card_holder_name' => 'O nome do titular do cartão deve conter nome e sobrenome',
            ]);
        }

        return $checkout
            ->withCreditCard(
                number: $payload['card_number'] ?? '',
                holderName: $payload['card_holder_name'] ?? $payload['name'] ?? '',
                expiryMonth: $expiryMonth,
                expiryYear: $expiryYear,
                cvv: $payload['card_cvv'] ?? '',
            )
            ->withCardHolder(
                name: $payload['card_holder_name'] ?? $payload['name'] ?? '',
                email: $holder['email'] ?? '',
                document: $holder['document'],
                address: $address,
                phone: $holder['phone'],
            );
    }

    /**
     * Parse card expiry string to month and year.
     *
     * @return array{0: string, 1: string}
     */
    protected function parseCardExpiry(string $expiry): array
    {
        $parts = preg_split('/[\/\-]/', $expiry);

        $month = $parts[0] ?? '';
        $year = $parts[1] ?? '';

        // Ensure month has 2 digits
        $month = str_pad($month, 2, '0', STR_PAD_LEFT);

        // Convert 2-digit year to 4-digit
        if (strlen($year) === 2) {
            $year = '20' . $year;
        }

        return [$month, $year];
    }

    /**
     * Resolve PaymentMethod from string.
     */
    protected function resolvePaymentMethod(string $method): PaymentMethod
    {
        return match (strtolower($method)) {
            'card', 'credit_card', 'creditcard' => PaymentMethod::CREDIT_CARD,
            'boleto', 'bank_slip' => PaymentMethod::BOLETO,
            default => PaymentMethod::PIX,
        };
    }

    /**
     * Check if we should update the local status based on gateway status.
     */
    protected function shouldUpdateStatus(Payment $payment, string $gatewayStatus): bool
    {
        $confirmedStatuses = ['CONFIRMED', 'RECEIVED'];

        return in_array($gatewayStatus, $confirmedStatuses, true)
            && $payment->status !== PaymentStatus::PAID;
    }

    /**
     * Map gateway status to PaymentStatus.
     */
    protected function mapGatewayStatus(string $gatewayStatus): PaymentStatus
    {
        return match (strtoupper($gatewayStatus)) {
            'CONFIRMED', 'RECEIVED' => PaymentStatus::PAID,
            'REFUNDED' => PaymentStatus::REFUNDED,
            'OVERDUE' => PaymentStatus::EXPIRED,
            default => PaymentStatus::PENDING,
        };
    }

    /**
     * Get payment status by UUID.
     */
    public function getPaymentStatus(string $uuid, User $user): ?array
    {
        $payment = Payment::where('uuid', $uuid)
            ->where('user_id', $user->id)
            ->first();

        if (! $payment) {
            return null;
        }

        // Refresh status from gateway if pending
        if ($payment->status === PaymentStatus::PENDING && $payment->gateway_reference) {
            $gatewayStatus = Gateway::driver($payment->gateway)
                ->payments()
                ->getStatus($payment->gateway_reference);

            if ($gatewayStatus && $this->shouldUpdateStatus($payment, $gatewayStatus)) {
                $payment->update(['status' => $this->mapGatewayStatus($gatewayStatus)]);
                $payment->refresh();
            }
        }

        return [
            'uuid' => $payment->uuid,
            'status' => $payment->status->value,
            'paid' => $payment->status === PaymentStatus::PAID,
            'amount_cents' => $payment->amount_cents,
            'payment_method' => $payment->payment_method->value,
            'created_at' => $payment->created_at->toIso8601String(),
        ];
    }

    /**
     * Deposit amount to user's wallet (direct, no payment).
     */
    public function deposit(User $user, $amount, ?array $meta = null, bool $confirmed = true): Transaction
    {
        $cents = toCents($amount);

        return $user->deposit($cents, $meta, $confirmed);
    }

    /**
     * Withdraw amount from user's wallet.
     */
    public function withdraw(User $user, $amount, ?array $meta = null): Transaction
    {
        $amount = amountToDec($amount);

        return $user->withdraw($amount, $meta);
    }

    /**
     * Get wallet data for user.
     */
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

        // Get pending payments
        $pendingPayments = Payment::where('user_id', $user->id)
            ->where('billable_type', Wallet::class)
            ->where('status', PaymentStatus::PENDING)
            ->orderByDesc('created_at')
            ->limit(5)
            ->get()
            ->map(fn(Payment $p) => [
                'uuid' => $p->uuid,
                'amount_cents' => $p->amount_cents,
                'payment_method' => $p->payment_method->value,
                'created_at' => $p->created_at->format('c'),
            ]);

        return [
            'balance' => $wallet?->balance ?? 0,
            'balanceFloat' => $wallet?->balanceFloat ?? 0,
            'transactions' => $transactions,
            'pending_payments' => $pendingPayments,
        ];
    }

    /**
     * Format currency for display.
     */
    public function formatCurrency(int|float $amount): string
    {
        return 'R$ ' . number_format($amount / 100, 2, ',', '.');
    }

    /**
     * Get chart data for wallet balance evolution.
     * Returns monthly aggregated data for the last 6 months.
     */
    public function getChartData(User $user, int $months = 6): array
    {
        $startDate = now()->subMonths($months)->startOfMonth();

        // Get all paid payments in the period
        $payments = Payment::where('user_id', $user->id)
            ->where('status', PaymentStatus::PAID)
            ->where('paid_at', '>=', $startDate)
            ->orderBy('paid_at')
            ->get();

        // Group by month
        $monthlyData = [];
        $currentDate = $startDate->copy();
        $runningTotal = 0;

        // Get initial balance (sum of all payments before start date)
        $initialBalance = Payment::where('user_id', $user->id)
            ->where('status', PaymentStatus::PAID)
            ->where('paid_at', '<', $startDate)
            ->sum('amount_cents');

        $runningTotal = (int) $initialBalance;

        while ($currentDate <= now()) {
            $monthKey = $currentDate->format('Y-m');
            $monthLabel = $currentDate->translatedFormat('d/M');

            // Sum payments for this month
            $monthPayments = $payments->filter(function ($payment) use ($currentDate) {
                return $payment->paid_at &&
                    $payment->paid_at->format('Y-m') === $currentDate->format('Y-m');
            });

            $monthTotal = $monthPayments->sum('amount_cents');
            $runningTotal += $monthTotal;

            $monthlyData[] = [
                'name' => $monthLabel,
                'value' => $runningTotal / 100, // Convert to decimal
                'month' => $currentDate->translatedFormat('M/Y'),
                'deposits' => $monthPayments->count(),
            ];

            $currentDate->addMonth();
        }

        // Calculate growth percentage
        $growth = 0;
        if (\count($monthlyData) >= 2) {
            $firstValue = $monthlyData[0]['value'] ?? 0;
            $lastValue = $monthlyData[\count($monthlyData) - 1]['value'] ?? 0;

            if ($firstValue > 0) {
                $growth = round((($lastValue - $firstValue) / $firstValue) * 100, 1);
            } elseif ($lastValue > 0) {
                $growth = 100;
            }
        }

        return [
            'data' => $monthlyData,
            'growth' => $growth,
        ];
    }
}
