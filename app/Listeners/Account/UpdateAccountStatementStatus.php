<?php

declare(strict_types=1);

namespace App\Listeners\Account;

use App\Models\AccountStatement;
use App\Modules\Payments\Events\PaymentFailed;
use App\Modules\Payments\Events\PaymentPaid;
use App\Modules\Payments\Events\PaymentRefunded;
use Illuminate\Support\Facades\Log;

/**
 * Updates AccountStatement status when payment status changes.
 *
 * Listens to PaymentPaid, PaymentFailed, and PaymentRefunded events
 * to keep statement status in sync with payment gateway.
 */
class UpdateAccountStatementStatus
{
    /**
     * Handle PaymentPaid event.
     */
    public function handlePaid(PaymentPaid $event): void
    {
        $statement = AccountStatement::where('payment_id', $event->payment->uuid)
            ->where('status', 'pending')
            ->first();

        if (!$statement) {
            return;
        }

        try {
            $statement->markCompleted();

        } catch (\Exception $e) {
            Log::error('Failed to update account statement status (paid)', [
                'statement_id' => $statement->id,
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
        $statement = AccountStatement::where('payment_id', $event->payment->uuid)
            ->where('status', 'pending')
            ->first();

        if (!$statement) {
            return;
        }

        try {
            $statement->markFailed();

            Log::info('Account statement marked as failed', [
                'statement_id' => $statement->id,
                'payment_uuid' => $event->payment->uuid,
                'category' => $statement->category,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to update account statement status (failed)', [
                'statement_id' => $statement->id,
                'payment_uuid' => $event->payment->uuid,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Handle PaymentRefunded event.
     */
    public function handleRefunded(PaymentRefunded $event): void
    {
        // Find original service payment statement
        $originalStatement = AccountStatement::where('payment_id', $event->payment->uuid)
            ->where('type', 'service_payment')
            ->first();

        if (!$originalStatement) {
            return;
        }

        try {
            // Create refund entry (positive amount)
            $refundStatement = AccountStatement::create([
                'user_id' => $originalStatement->user_id,
                'statementable_type' => $originalStatement->statementable_type,
                'statementable_id' => $originalStatement->statementable_id,
                'type' => 'refund',
                'category' => str_replace('_payment', '_refund', $originalStatement->category),
                'amount' => abs($originalStatement->amount), // Positivo (entrada)
                'wallet_amount' => abs($originalStatement->wallet_amount),
                'gateway_amount' => abs($originalStatement->gateway_amount),
                'payment_method' => $originalStatement->payment_method,
                'gateway' => $originalStatement->gateway,
                'payment_id' => $event->payment->uuid,
                'status' => 'completed',
                'description' => "Reembolso: {$originalStatement->description}",
                'meta' => $originalStatement->meta,
                'completed_at' => now(),
            ]);

            // Mark original statement as refunded
            $originalStatement->update(['status' => 'refunded']);

            Log::info('Account statement refund created', [
                'refund_statement_id' => $refundStatement->id,
                'original_statement_id' => $originalStatement->id,
                'payment_uuid' => $event->payment->uuid,
                'amount' => $refundStatement->amount,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to create refund statement', [
                'original_statement_id' => $originalStatement->id ?? null,
                'payment_uuid' => $event->payment->uuid,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
