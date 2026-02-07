<?php

declare(strict_types=1);

namespace App\Services\Campaign;

use App\Enums\CampaignStatus;
use App\Models\Address;
use App\Models\Campaign;
use App\Models\User;
use App\Modules\Payments\Checkout\CheckoutResult;
use App\Modules\Payments\Core\DTOs\Shared\AddressRequest;
use App\Modules\Payments\Enums\PaymentMethod;
use App\Modules\Payments\Enums\PaymentStatus;
use App\Modules\Payments\Facades\Checkout;
use App\Modules\Payments\Models\Payment;
use Illuminate\Support\Facades\DB;
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
     * Returns CheckoutResult for gateway payments (PIX/Card),
     * or array for non-gateway paths (wallet-only, free submit).
     */
    public function processCheckout(Campaign $campaign, User $user, array $payload): CheckoutResult|array
    {
        // Calculate grand total (estimated_total + publication_fee)
        $pricePerInfluencer = (float) ($campaign->price_per_influencer ?? 0);
        $slotsToApprove = (int) ($campaign->slots_to_approve ?? 0);
        $estimatedTotal = $slotsToApprove * $pricePerInfluencer;
        $publicationFee = $this->getPublicationFee($campaign->publication_plan);
        $grandTotal = $estimatedTotal + $publicationFee;

        if ($grandTotal <= 0) {
            return $this->submitCampaignDirectly($campaign);
        }

        $useWalletBalance = $payload['use_wallet_balance'] ?? false;
        $walletAmount = min(
            (float) ($payload['wallet_amount'] ?? 0),
            $user->wallet?->balanceFloat ?? 0,
            $grandTotal // Can't use more than grand total
        );

        //Total a pagar
        $remainingAmount = $grandTotal - $walletAmount;

        // If wallet covers everything - Se a carteira cobrir tudo
        if ($useWalletBalance && $remainingAmount <= 0) {
            return $this->payWithWalletOnly($campaign, $user, $grandTotal);
        }

        // Process payment for remaining amount
        return $this->processPaymentCheckout(
            campaign: $campaign,
            user: $user,
            amount: $remainingAmount,
            walletAmount: $useWalletBalance ? $walletAmount : 0,
            estimatedTotal: $estimatedTotal,
            publicationFee: $publicationFee,
            payload: $payload
        );
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
     */
    protected function payWithWalletOnly(Campaign $campaign, User $user, float $grandTotal): array
    {
        return DB::transaction(function () use ($campaign, $user, $grandTotal) {

        //TODO usar base do wallet
            if ($user->wallet->balanceFloat < $grandTotal) {
                return [
                    'success' => false,
                    'message' => 'Saldo insuficiente na carteira.',
                ];
            }

            // Calculate breakdown
            $pricePerInfluencer = (float) ($campaign->price_per_influencer ?? 0);
            $slotsToApprove = (int) ($campaign->slots_to_approve ?? 0);
            $estimatedTotal = $slotsToApprove * $pricePerInfluencer;
            $publicationFee = $grandTotal - $estimatedTotal;

            // Withdraw from wallet
            $user->withdraw(toCents($grandTotal), [
                'description' => "Pagamento completo da campanha - {$campaign->name}",
                'campaign_id' => $campaign->id,
                'type' => 'campaign_full_payment',
                'estimated_total' => $estimatedTotal,
                'publication_fee' => $publicationFee,
            ]);

            // Update campaign with payment info
            $campaign->update([
                'publication_fee' => $publicationFee,
                'publication_wallet_amount' => $grandTotal,
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
        float $amount,
        float $walletAmount,
        float $estimatedTotal,
        float $publicationFee,
        array $payload
    ): CheckoutResult|array {
        // Check if campaign is complete
        if (!$campaign->isComplete()) {
            return [
                'success' => false,
                'message' => 'Campanha incompleta. Preencha todos os campos obrigatórios.',
            ];
        }

        // Check for existing pending payment
        $existingPayment = $this->findExistingPendingPayment($campaign, $amount);
        if ($existingPayment) {
            return CheckoutResult::pending($existingPayment);
        }

        return DB::transaction(function () use ($campaign, $user, $amount, $walletAmount, $payload, $estimatedTotal, $publicationFee) {
            // Deduct wallet amount if any
            if ($walletAmount > 0) {
                $user->withdraw(toCents($walletAmount), [
                    'description' => "Pagamento parcial da campanha - {$campaign->name}",
                    'campaign_id' => $campaign->id,
                    'type' => 'campaign_partial_payment',
                    'estimated_total' => $estimatedTotal,
                    'publication_fee' => $publicationFee,
                ]);
            }

            $paymentMethod = $this->resolvePaymentMethod($payload['payment_method']);
            $cents = toCents($amount);

            $metaProduct = $campaign->getMetaProduct();

            // Build checkout
            $checkout = Checkout::for($user)
                ->billable($campaign)
                ->amount($cents)
                ->method($paymentMethod)
                ->gateway('asaas')
                ->useWallet(false)
                ->description("{$metaProduct['description']}")
                ->meta($metaProduct);

            // Add card data if credit card
            if ($paymentMethod === PaymentMethod::CREDIT_CARD) {
                $checkout = $this->addCreditCardData($checkout, $user, $payload);
            }

            /** @var CheckoutResult $result */
            $result = $checkout->create();

            // Update campaign with partial payment info
            $campaign->update([
                'publication_fee' => $publicationFee,
                'publication_wallet_amount' => $walletAmount,
                'publication_payment_id' => $result->payment->uuid,
            ]);

            // Credit card approved → SENT_TO_CREATORS (imediato)
            if ($result->isPaid()) {
                $campaign->update([
                    'publication_paid_at' => now(),
                    'publication_payment_method' => $result->payment->payment_method->value,
                ]);
                $campaign->submit();
            }

            // PIX/Pending → AWAITING_PAYMENT (aguarda confirmação via webhook)
            if ($result->isPending() && $campaign->isDraft()) {
                $campaign->markAwaitingPayment();
            }

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
