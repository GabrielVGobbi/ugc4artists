<?php

declare(strict_types=1);

namespace App\Listeners\Campaign;

use App\Events\Campaign\CampaignCheckoutCompleted;
use App\Models\CampaignTransaction;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;

/**
 * Logs campaign payment transactions for transaction history/extrato.
 *
 * Listens to CampaignCheckoutCompleted event and creates a CampaignTransaction record
 * with full breakdown of the payment (wallet-only, gateway-only, or mixed).
 */
class LogCampaignTransaction implements ShouldQueue
{
    /**
     * Handle the event.
     */
    public function handle(CampaignCheckoutCompleted $event): void
    {
        try {
            $transaction = CampaignTransaction::create([
                'user_id' => $event->campaign->user_id,
                'campaign_id' => $event->campaign->id,
                'payment_id' => $event->payment?->uuid,
                'type' => $event->checkoutType,
                'status' => $event->status,
                'campaign_cost' => $event->calculation->estimatedTotal,
                'publication_fee' => $event->calculation->publicationFee,
                'total_amount' => $event->calculation->grandTotal,
                'wallet_amount' => $event->calculation->walletAmount,
                'gateway_amount' => $event->calculation->remainingAmount,
                'payment_method' => $this->resolvePaymentMethod($event),
                'gateway' => $event->payment?->gateway ?? null,
                'meta' => $event->calculation->toArray(),
                'completed_at' => $event->status === 'completed' ? now() : null,
            ]);

            Log::info('Campaign transaction logged', [
                'transaction_id' => $transaction->id,
                'campaign_id' => $event->campaign->id,
                'type' => $event->checkoutType,
                'status' => $event->status,
                'total' => $event->calculation->grandTotal,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to log campaign transaction', [
                'campaign_id' => $event->campaign->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            // Don't throw - logging failure shouldn't break checkout
        }
    }

    /**
     * Resolve payment method from event.
     */
    protected function resolvePaymentMethod(CampaignCheckoutCompleted $event): string
    {
        // For wallet-only, payment method is 'wallet'
        if ($event->checkoutType === 'wallet_only') {
            return 'wallet';
        }

        // For gateway or mixed, use payment's method
        return $event->payment?->payment_method?->value ?? 'unknown';
    }
}
