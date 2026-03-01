<?php

declare(strict_types=1);

namespace App\Services\Campaign;

use App\Enums\CampaignStatus;
use App\Events\Account\ServicePaid;
use App\Events\Campaign\CampaignCheckoutCompleted;
use App\Models\Address;
use App\Models\Campaign;
use App\Models\User;
use App\Modules\Payments\Checkout\CheckoutResult;
use App\Modules\Payments\Core\DTOs\Shared\AddressRequest;
use App\Modules\Payments\Enums\PaymentMethod;
use App\Modules\Payments\Enums\PaymentStatus;
use App\Modules\Payments\Exceptions\InsufficientFundsException;
use App\Modules\Payments\Facades\Checkout;
use App\Modules\Payments\Models\Payment;
use App\Services\Campaign\ValueObjects\CheckoutCalculation;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class CampaignCheckoutService
{
    /**
     * Get publication fee for a plan.
     */
    public function getPublicationFee(?string $plan): float
    {
        $plans = collect(config('campaigns.publication_plans', []));
        $selectedPlan = $plans->firstWhere('id', $plan ?? 'basic');

        return (float) ($selectedPlan['price'] ?? 0);
    }

    /**
     * Process campaign checkout.
     *
     * New logic:
     * - payment_method: 'pix' | 'card' (ONLY gateway methods, no 'wallet')
     * - use_wallet_balance: true/false (controls wallet usage)
     *
     * Scenarios:
     * 1. Wallet-only: use_wallet_balance = true + wallet >= total → Direct approval, no payment
     * 2. Mixed: use_wallet_balance = true + wallet < total → Partial wallet + gateway payment
     * 3. Gateway-only: use_wallet_balance = false → Full gateway payment (payment_method required)
     *
     * Returns CheckoutResult for gateway payments (PIX/Card),
     * or array for non-gateway paths (wallet-only, free submit).
     */
    public function processCheckout(Campaign $campaign, User $user, array $payload): CheckoutResult|array
    {
        // Prevent concurrent checkouts for same campaign/user (race condition protection)
        $lockKey = "campaign-checkout:{$campaign->id}:{$user->id}";
        $lock = Cache::lock($lockKey, 30);

        if (!$lock->get()) {
            Log::warning('Concurrent checkout attempt blocked', [
                'campaign_id' => $campaign->id,
                'user_id' => $user->id,
            ]);

            return [
                'success' => false,
                'message' => 'Já existe um checkout em andamento para esta campanha. Aguarde alguns segundos e tente novamente.',
            ];
        }

        try {
            Log::info('Campaign checkout started', [
                'campaign_id' => $campaign->id,
                'user_id' => $user->id,
                'use_wallet_balance' => $payload['use_wallet_balance'] ?? false,
                'payment_method' => $payload['payment_method'] ?? null,
            ]);

            // Transition draft campaigns to awaiting payment
            if ($campaign->isDraft()) {
                $campaign->markAwaitingPayment();
            }

            return $this->executeCheckout($campaign, $user, $payload);
        } finally {
            $lock->release();
        }
    }

    /**
     * Execute checkout logic (called after lock is acquired).
     */
    protected function executeCheckout(Campaign $campaign, User $user, array $payload): CheckoutResult|array
    {
        $useWalletBalance = $payload['use_wallet_balance'] ?? false;

        // Use CheckoutCalculation Value Object for all calculations
        $calculation = CheckoutCalculation::fromCampaign(
            campaign: $campaign,
            user: $user,
            useWallet: $useWalletBalance,
        );

        if ($calculation->isFree()) {
            return $this->submitCampaignDirectly($campaign);
        }

        // Validate campaign value limits
        $minValue = config('campaigns.checkout.min_campaign_value', 50);
        $maxValue = config('campaigns.checkout.max_campaign_value', 100000);

        if ($calculation->grandTotal < $minValue) {
            return [
                'success' => false,
                'message' => sprintf(
                    'O valor mínimo para uma campanha é R$ %s',
                    number_format($minValue, 2, ',', '.')
                ),
            ];
        }

        if ($calculation->grandTotal > $maxValue) {
            return [
                'success' => false,
                'message' => 'O valor da campanha excede o limite máximo. Entre em contato com o suporte para campanhas acima de R$ ' . number_format($maxValue, 2, ',', '.'),
            ];
        }

        // Scenario 1: Wallet covers everything (wallet-only payment)
        if ($calculation->isWalletOnly()) {
            $result = $this->payWithWalletOnly($campaign, $user, $calculation);

            // Dispatch events
            event(new CampaignCheckoutCompleted(
                campaign: $campaign->fresh(),
                payment: null,
                calculation: $calculation,
                checkoutType: 'wallet_only',
                status: 'completed',
                context: ['completed_at' => now()->toISOString()],
            ));

            event(new ServicePaid(
                service: $campaign->fresh(),
                payment: null,
                calculation: $calculation,
                category: 'campaign_payment',
                status: 'completed',
            ));

            Log::info('Campaign checkout completed - Wallet only', [
                'campaign_id' => $campaign->id,
                'user_id' => $user->id,
                'total_paid' => $calculation->grandTotal,
                'payment_type' => 'wallet_only',
            ]);

            return $result;
        }

        // Scenario 2 & 3: Need gateway payment (with or without partial wallet)
        // Validate payment_method is provided
        if ($calculation->remainingAmount > 0 && empty($payload['payment_method'])) {
            Log::warning('Checkout failed - Insufficient wallet and no payment method', [
                'campaign_id' => $campaign->id,
                'user_id' => $user->id,
                'wallet_balance' => $calculation->walletBalance,
                'total_required' => $calculation->grandTotal,
                'remaining_amount' => $calculation->remainingAmount,
            ]);

            return [
                'success' => false,
                'message' => 'Saldo insuficiente na carteira. Selecione um método de pagamento (PIX ou Cartão) para completar o pagamento.',
                'breakdown' => $calculation->toArray(),
            ];
        }

        $result = $this->processPaymentCheckout(
            campaign: $campaign,
            user: $user,
            calculation: $calculation,
            payload: $payload
        );

        Log::info('Campaign checkout completed - Gateway payment', [
            'campaign_id' => $campaign->id,
            'user_id' => $user->id,
            'payment_method' => $payload['payment_method'],
            'wallet_amount' => $calculation->walletAmount,
            'gateway_amount' => $calculation->remainingAmount,
            'payment_type' => $calculation->isMixed() ? 'mixed' : 'gateway_only',
        ]);

        return $result;
    }

    /**
     * Submit campaign directly (no payment needed).
     */
    protected function submitCampaignDirectly(Campaign $campaign): array
    {
        if (!$campaign->isComplete()) {
            return [
                'success' => false,
                'message' => 'Campanha incompleta. Preencha todos os campos obrigatórios.',
            ];
        }

        $campaign->submit();

        return [
            'success' => true,
            'message' => 'Campanha enviada para revisão!',
            'campaign' => $campaign->fresh(),
            'redirect' => route('app.campaigns.index'),
        ];
    }

    /**
     * Pay with wallet balance only.
     * This method is called when wallet balance covers the full campaign cost.
     */
    protected function payWithWalletOnly(
        Campaign $campaign,
        User $user,
        CheckoutCalculation $calculation
    ): array {
        return DB::transaction(function () use ($campaign, $user, $calculation) {
            $walletBalance = $user->wallet?->balanceFloat ?? 0;

            // Double-check wallet balance
            if ($walletBalance < $calculation->grandTotal) {
                throw InsufficientFundsException::forWallet(
                    requiredCents: toCents($calculation->grandTotal),
                    availableCents: toCents($walletBalance)
                );
            }

            // Withdraw from wallet (convert to cents for wallet system)
            $user->withdraw(toCents($calculation->grandTotal), [
                'description' => "Pagamento completo da campanha - {$campaign->name}",
                'campaign_id' => $campaign->id,
                'type' => 'campaign_full_payment',
                'estimated_total' => $calculation->estimatedTotal,
                'publication_fee' => $calculation->publicationFee,
            ]);

            // Update campaign with payment info
            $campaign->update([
                'publication_fee' => $calculation->publicationFee,
                'publication_wallet_amount' => $calculation->grandTotal,
                'publication_paid_at' => now(),
                'publication_payment_method' => 'wallet',
            ]);

            // Submit campaign
            if (!$campaign->submit()) {
                throw new \Exception('Falha ao submeter campanha.');
            }

            return [
                'success' => true,
                'message' => 'Pagamento realizado com sucesso! Campanha enviada para revisão.',
                'campaign' => $campaign->fresh(),
                'redirect' => route('app.campaigns.index'),
                'paid_with_wallet' => true,
                'breakdown' => $calculation->toArray(),
            ];
        });
    }

    /**
     * Process payment checkout (PIX or Card).
     *
     * Returns CheckoutResult directly for proper controller handling.
     *
     * @throws ValidationException
     */
    protected function processPaymentCheckout(
        Campaign $campaign,
        User $user,
        CheckoutCalculation $calculation,
        array $payload
    ): CheckoutResult|array {
        // Check if campaign is complete
        if (!$campaign->isComplete()) {
            return [
                'success' => false,
                'message' => 'Campanha incompleta. Preencha todos os campos obrigatórios.',
            ];
        }

        // Validate amount to charge
        if ($calculation->remainingAmount <= 0) {
            return [
                'success' => false,
                'message' => 'Valor de pagamento inválido.',
            ];
        }

        // Check for existing pending payment
        $existingPayment = $this->findExistingPendingPayment($campaign, $calculation->remainingAmount);
        if ($existingPayment) {
            return CheckoutResult::pending($existingPayment);
        }

        return DB::transaction(function () use ($campaign, $user, $calculation, $payload) {
            // Deduct wallet amount first (partial payment scenario)
            // Example: Campaign = R$500, Wallet = R$200 → Withdraw R$200, charge R$300 via gateway
            if ($calculation->walletAmount > 0) {
                $walletBalance = $user->wallet?->balanceFloat ?? 0;

                // Safety check before withdrawal
                if ($walletBalance < $calculation->walletAmount) {
                    throw InsufficientFundsException::forWallet(
                        requiredCents: toCents($calculation->walletAmount),
                        availableCents: toCents($walletBalance)
                    );
                }

                $user->withdraw(toCents($calculation->walletAmount), [
                    'description' => "Pagamento parcial da campanha - {$campaign->name}",
                    'campaign_id' => $campaign->id,
                    'type' => 'campaign_partial_payment',
                    'estimated_total' => $calculation->estimatedTotal,
                    'publication_fee' => $calculation->publicationFee,
                ]);
            }

            $paymentMethod = $this->resolvePaymentMethod($payload['payment_method']);

            $cents = toCents($calculation->remainingAmount);

            $metaProduct = $campaign->getMetaProduct();

            // Build checkout
            $checkout = Checkout::for($user)
                ->billable($campaign)
                ->amount($cents)
                ->method($paymentMethod)
                ->gateway('asaas')
                ->useWallet(false)
                ->description("{$metaProduct['description']}")
                ->meta(array_merge($metaProduct, [
                    'checkout_calculation' => $calculation->toArray(),
                ]));

            // Add card data if credit card
            if ($paymentMethod === PaymentMethod::CREDIT_CARD) {
                $checkout = $this->addCreditCardData($checkout, $user, $payload);
            }

            /** @var CheckoutResult $result */
            $result = $checkout->create();

            // Update campaign with payment info
            $campaign->update([
                'publication_fee' => $calculation->publicationFee,
                'publication_wallet_amount' => $calculation->walletAmount,
                'publication_payment_id' => $result->payment->uuid,
            ]);

            // Determine checkout type and status
            $checkoutType = $calculation->isMixed() ? 'mixed' : 'gateway_only';
            $status = $result->isPaid() ? 'completed' : 'pending';

            // Credit card approved → SENT_TO_CREATORS (immediate)
            if ($result->isPaid()) {
                $campaign->update([
                    'publication_paid_at' => now(),
                    'publication_payment_method' => $result->payment->payment_method->value,
                ]);
                $campaign->submit();
            }

            // PIX/Pending → AWAITING_PAYMENT (awaits webhook confirmation)
            if ($result->isPending() && $campaign->isDraft()) {
                $campaign->markAwaitingPayment();
            }

            // Dispatch events
            event(new CampaignCheckoutCompleted(
                campaign: $campaign->fresh(),
                payment: $result->payment,
                calculation: $calculation,
                checkoutType: $checkoutType,
                status: $status,
                context: [
                    'payment_method' => $payload['payment_method'],
                    'is_immediate' => $result->isPaid(),
                    'created_at' => now()->toISOString(),
                ],
            ));

            event(new ServicePaid(
                service: $campaign->fresh(),
                payment: $result->payment,
                calculation: $calculation,
                category: 'campaign_payment',
                status: $status,
            ));

            return $result;
        });
    }

    /**
     * Find existing pending payment.
     */
    protected function findExistingPendingPayment(Campaign $campaign, float $amount): ?Payment
    {
        return Payment::where('billable_type', Campaign::class)
            ->where('billable_id', $campaign->id)
            ->where('amount_cents', toCents($amount) * 100)
            ->where('status', PaymentStatus::PENDING)
            ->where('created_at', '>=', now()->subMinutes(10))
            ->orderByDesc('created_at')
            ->first();
    }

    /**
     * Add credit card data to checkout.
     * Usa dados de faturamento do payload (name, document, phone, address_id) quando enviados.
     */
    protected function addCreditCardData($checkout, User $user, array $payload)
    {
        $expiry = $payload['card_expiry'] ?? '';
        [$expiryMonth, $expiryYear] = $this->parseCardExpiry($expiry);

        $holder = $checkout->getHolder();
        $addressData = $this->resolveAddressForCheckout($user, $payload);

        throw_if(
            !$addressData,
            ValidationException::class,
            ValidationException::withMessages(['address_id' => 'Selecione um endereço de cobrança.'])
        );

        $address = AddressRequest::fromArray($addressData->toArray());

        $cardHolderName = $payload['card_holder_name'] ?? $payload['name'] ?? '';
        if (str_word_count($cardHolderName) < 2) {
            throw ValidationException::withMessages([
                'card_holder_name' => 'O nome do titular deve conter nome e sobrenome.',
            ]);
        }

        $name = $payload['name'] ?? $holder->name ?? '';
        $document = $payload['document'] ?? $holder->document ?? '';
        $phone = $payload['phone'] ?? $holder->phone ?? '';

        return $checkout
            ->withCreditCard(
                number: $payload['card_number'] ?? '',
                holderName: $cardHolderName,
                expiryMonth: $expiryMonth,
                expiryYear: $expiryYear,
                cvv: $payload['card_cvv'] ?? '',
            )
            ->withCardHolder(
                name: $cardHolderName,
                email: $holder->email ?? '',
                document: $document,
                address: $address,
                phone: $phone,
            );
    }

    /**
     * Resolve address from payload address_id (user's) or user default.
     */
    protected function resolveAddressForCheckout(User $user, array $payload): ?Address
    {
        $addressId = $payload['address_id'] ?? null;

        if (!empty($addressId)) {
            $address = $user->addresses()
                ->where(function ($q) use ($addressId) {
                    if (Str::isUuid($addressId)) {
                        $q->where('uuid', $addressId);
                    } else {
                        $q->where('id', $addressId);
                    }
                })
                ->first();

            if ($address) {
                return $address;
            }
        }

        return $user->defaultAddress();
    }

    /**
     * Parse card expiry.
     */
    protected function parseCardExpiry(string $expiry): array
    {
        $parts = preg_split('/[\/\-]/', $expiry);
        $month = str_pad($parts[0] ?? '', 2, '0', STR_PAD_LEFT);
        $year = $parts[1] ?? '';

        if (strlen($year) === 2) {
            $year = '20' . $year;
        }

        return [$month, $year];
    }

    /**
     * Resolve payment method.
     */
    protected function resolvePaymentMethod(string $method): PaymentMethod
    {
        return match (strtolower($method)) {
            'card', 'credit_card' => PaymentMethod::CREDIT_CARD,
            'wallet' => PaymentMethod::WALLET,
            default => PaymentMethod::PIX,
        };
    }
}
