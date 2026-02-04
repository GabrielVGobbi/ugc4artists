<?php

declare(strict_types=1);

namespace App\Services\Campaign;

use App\Models\Campaign;
use App\Models\User;
use App\Modules\Payments\Checkout\CheckoutResult;
use App\Modules\Payments\Core\DTOs\Shared\AddressRequest;
use App\Modules\Payments\Enums\PaymentMethod;
use App\Modules\Payments\Enums\PaymentStatus;
use App\Modules\Payments\Facades\Checkout;
use App\Modules\Payments\Models\Payment;
use Illuminate\Support\Facades\DB;
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
     */
    public function processCheckout(Campaign $campaign, User $user, array $payload): array
    {
        $publicationFee = $this->getPublicationFee($campaign->publication_plan);

        // If no fee, just submit the campaign
        if ($publicationFee <= 0) {
            return $this->submitCampaignDirectly($campaign);
        }

        $useWalletBalance = $payload['use_wallet_balance'] ?? false;
        $walletAmount = min(
            (float) ($payload['wallet_amount'] ?? 0),
            $user->wallet?->balanceFloat ?? 0
        );

        // Calculate remaining amount after wallet deduction
        $remainingAmount = $publicationFee - $walletAmount;

        // If wallet covers everything
        if ($useWalletBalance && $remainingAmount <= 0) {
            return $this->payWithWalletOnly($campaign, $user, $publicationFee);
        }

        // Process payment for remaining amount
        return $this->processPaymentCheckout(
            campaign: $campaign,
            user: $user,
            amount: $remainingAmount,
            walletAmount: $useWalletBalance ? $walletAmount : 0,
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
    protected function payWithWalletOnly(Campaign $campaign, User $user, float $amount): array
    {
        return DB::transaction(function () use ($campaign, $user, $amount) {
            // Check wallet balance
            if ($user->wallet->balanceFloat < $amount) {
                return [
                    'success' => false,
                    'message' => 'Saldo insuficiente na carteira.',
                ];
            }

            // Withdraw from wallet
            $user->withdraw(toCents($amount), [
                'description' => "Taxa de publicação - Campanha: {$campaign->name}",
                'campaign_id' => $campaign->id,
                'type' => 'campaign_publication_fee',
            ]);

            // Update campaign with payment info
            $campaign->update([
                'publication_fee' => $amount,
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
     */
    protected function processPaymentCheckout(
        Campaign $campaign,
        User $user,
        float $amount,
        float $walletAmount,
        array $payload
    ): array {
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
            return $this->buildResultFromExisting($existingPayment);
        }

        return DB::transaction(function () use ($campaign, $user, $amount, $walletAmount, $payload) {
            // Deduct wallet amount if any
            if ($walletAmount > 0) {
                $user->withdraw(toCents($walletAmount), [
                    'description' => "Taxa de publicação (parcial) - Campanha: {$campaign->name}",
                    'campaign_id' => $campaign->id,
                    'type' => 'campaign_publication_fee_partial',
                ]);
            }

            $paymentMethod = $this->resolvePaymentMethod($payload['payment_method']);
            $cents = toCents($amount);

            // Build checkout
            $checkout = Checkout::for($user)
                ->billable($campaign)
                ->amount($cents)
                ->method($paymentMethod)
                ->gateway('asaas')
                ->useWallet(false)
                ->description("Taxa de publicação - {$campaign->name}")
                ->meta([
                    'type' => 'campaign_publication_fee',
                    'campaign_id' => $campaign->id,
                    'campaign_uuid' => $campaign->uuid,
                    'wallet_amount_used' => $walletAmount,
                ]);

            // Add card data if credit card
            if ($paymentMethod === PaymentMethod::CREDIT_CARD) {
                $checkout = $this->addCreditCardData($checkout, $user, $payload);
            }

            $result = $checkout->create();

            // Update campaign with partial payment info
            $campaign->update([
                'publication_fee' => $amount + $walletAmount,
                'publication_wallet_amount' => $walletAmount,
            ]);

            return $this->buildCheckoutResponse($result, $campaign);
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
     * Build result from existing payment.
     */
    protected function buildResultFromExisting(Payment $payment): array
    {
        if ($payment->payment_method === PaymentMethod::PIX) {
            $pixData = $payment->meta['gateway']['qr_code_payload'] ?? null;

            return [
                'success' => true,
                'payment_id' => $payment->uuid,
                'status' => 'pending',
                'payment_method' => 'pix',
                'pix' => $pixData ? [
                    'payload' => $pixData,
                    'qr_code_image' => $payment->meta['gateway']['qr_code_image'] ?? null,
                ] : null,
                'redirect' => route('app.payments.show', $payment->uuid),
            ];
        }

        return [
            'success' => true,
            'payment_id' => $payment->uuid,
            'status' => $payment->status->value,
            'redirect' => route('app.payments.show', $payment->uuid),
        ];
    }

    /**
     * Build checkout response.
     */
    protected function buildCheckoutResponse(CheckoutResult $result, Campaign $campaign): array
    {
        $payment = $result->payment;

        $response = [
            'success' => true,
            'payment_id' => $payment->uuid,
            'status' => $payment->status->value,
            'campaign' => $campaign->fresh(),
        ];

        if ($result->isPix() && $result->pix) {
            $response['payment_method'] = 'pix';
            $response['pix'] = [
                'payload' => $result->pix->payload,
                'qr_code_image' => $result->pix->encodedImage,
            ];
        }

        if ($result->isPaid()) {
            $response['message'] = 'Pagamento confirmado! Campanha enviada para revisão.';
            $response['redirect'] = route('app.campaigns.index');

            // Submit campaign
            $campaign->submit();
        } else {
            $response['redirect'] = route('app.payments.show', $payment->uuid);
        }

        return $response;
    }

    /**
     * Add credit card data to checkout.
     */
    protected function addCreditCardData($checkout, User $user, array $payload)
    {
        $expiry = $payload['card_expiry'] ?? '';
        [$expiryMonth, $expiryYear] = $this->parseCardExpiry($expiry);

        $holder = $checkout->getHolder();
        $addressData = $holder->defaultAddress();

        throw_if(
            !$addressData,
            ValidationException::class,
            ValidationException::withMessages(['address' => 'Cadastre um endereço antes de continuar.'])
        );

        $address = AddressRequest::fromArray($addressData->toArray());

        $cardHolderName = $payload['card_holder_name'] ?? '';
        if (str_word_count($cardHolderName) < 2) {
            throw ValidationException::withMessages([
                'card_holder_name' => 'O nome do titular deve conter nome e sobrenome.',
            ]);
        }

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
                email: $holder['email'] ?? '',
                document: $holder['document'],
                address: $address,
                phone: $holder['phone'],
            );
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
