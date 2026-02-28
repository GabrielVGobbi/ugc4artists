<?php

declare(strict_types=1);

namespace App\Listeners\Campaign;

use App\Models\Campaign;
use App\Models\CampaignTransaction;
use App\Modules\Payments\Events\PaymentPaid;
use App\Modules\Payments\Events\PaymentFailed;
use Illuminate\Support\Facades\Log;

/**
 * Updates CampaignTransaction status when payment status changes.
 *
 * Listens to PaymentPaid and PaymentFailed events to keep transaction logs in sync.
 * When a PIX payment is confirmed via webhook, this marks the transaction as 'completed'.
 */
class UpdateCampaignTransactionStatus
{
    /**
     * Handle PaymentPaid event.
     */
    public function handlePaid(PaymentPaid $event): void
    {
        // Only process campaign payments
        if (!$event->payment->billable instanceof Campaign) {
            return;
        }

        $transaction = CampaignTransaction::where('payment_id', $event->payment->uuid)
            ->where('status', 'pending')
            ->first();

        if (!$transaction) {
            return;
        }

        try {
            $transaction->markCompleted();

            Log::info('Campaign transaction marked as completed', [
                'transaction_id' => $transaction->id,
                'payment_uuid' => $event->payment->uuid,
                'campaign_id' => $transaction->campaign_id,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to update campaign transaction status (paid)', [
                'transaction_id' => $transaction->id,
                'payment_uuid' => $event->payment->uuid,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Handle PaymentFailed event.
     */
    public function handleFailed(PaymentFailed $event): void
    {
        // Only process campaign payments
        if (!$event->payment->billable instanceof Campaign) {
            return;
        }

        $transaction = CampaignTransaction::where('payment_id', $event->payment->uuid)
            ->where('status', 'pending')
            ->first();

        if (!$transaction) {
            return;
        }

        try {
            $transaction->markFailed();

            Log::info('Campaign transaction marked as failed', [
                'transaction_id' => $transaction->id,
                'payment_uuid' => $event->payment->uuid,
                'campaign_id' => $transaction->campaign_id,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to update campaign transaction status (failed)', [
                'transaction_id' => $transaction->id,
                'payment_uuid' => $event->payment->uuid,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
