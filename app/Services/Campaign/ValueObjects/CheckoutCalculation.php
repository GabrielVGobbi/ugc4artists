<?php

declare(strict_types=1);

namespace App\Services\Campaign\ValueObjects;

use App\Models\Campaign;
use App\Models\User;
use App\Services\Campaign\CampaignCheckoutService;

readonly class CheckoutCalculation
{
    public function __construct(
        public float $estimatedTotal,      // slots * price_per_influencer
        public float $publicationFee,      // taxa do plano de publicação
        public float $grandTotal,          // total geral (estimated + fee)
        public float $walletBalance,       // saldo atual do usuário
        public float $walletAmount,        // quanto será usado da wallet
        public float $remainingAmount,     // quanto cobrar via gateway
    ) {}

    /**
     * Create CheckoutCalculation from Campaign and User.
     */
    public static function fromCampaign(
        Campaign $campaign,
        User $user,
        bool $useWallet,
        ?float $publicationFee = null
    ): self {
        $pricePerInfluencer = (float) ($campaign->price_per_influencer ?? 0);
        $slotsToApprove = (int) ($campaign->slots_to_approve ?? 0);
        $estimatedTotal = $slotsToApprove * $pricePerInfluencer;

        // Get publication fee from service if not provided
        if ($publicationFee === null) {
            $checkoutService = app(CampaignCheckoutService::class);
            $publicationFee = $checkoutService->getPublicationFee($campaign->publication_plan);
        }

        $grandTotal = $estimatedTotal + $publicationFee;
        $walletBalance = amountToDec($user->wallet?->balanceFloat) ?? 0;

        // Calculate wallet amount to use
        $walletAmount = $useWallet
            ? min($walletBalance, $grandTotal)
            : 0;

        $remainingAmount = max(0, $grandTotal - $walletAmount);

        return new self(
            estimatedTotal: $estimatedTotal,
            publicationFee: $publicationFee,
            grandTotal: $grandTotal,
            walletBalance: $walletBalance,
            walletAmount: $walletAmount,
            remainingAmount: $remainingAmount,
        );
    }

    /**
     * Check if wallet covers the entire payment.
     */
    public function isWalletOnly(): bool
    {
        return $this->walletAmount >= $this->grandTotal && $this->grandTotal > 0;
    }

    /**
     * Check if payment uses both wallet and gateway.
     */
    public function isMixed(): bool
    {
        return $this->walletAmount > 0 && $this->remainingAmount > 0;
    }

    /**
     * Check if payment uses only gateway (no wallet).
     */
    public function isGatewayOnly(): bool
    {
        return $this->walletAmount === 0.0 && $this->grandTotal > 0;
    }

    /**
     * Check if campaign is free (no payment needed).
     */
    public function isFree(): bool
    {
        return $this->grandTotal <= 0;
    }

    /**
     * Convert to array for API responses.
     */
    public function toArray(): array
    {
        return [
            'breakdown' => [
                'campaign_cost' => $this->estimatedTotal,
                'publication_fee' => $this->publicationFee,
                'subtotal' => $this->grandTotal,
                'from_wallet' => $this->walletAmount,
                'from_gateway' => $this->remainingAmount,
                'total' => $this->grandTotal,
            ],
            'wallet' => [
                'current_balance' => $this->walletBalance,
                'applied_amount' => $this->walletAmount,
                'remaining_balance' => max(0, $this->walletBalance - $this->walletAmount),
            ],
            'scenarios' => [
                'is_wallet_only' => $this->isWalletOnly(),
                'is_mixed' => $this->isMixed(),
                'is_gateway_only' => $this->isGatewayOnly(),
                'is_free' => $this->isFree(),
            ],
        ];
    }
}
