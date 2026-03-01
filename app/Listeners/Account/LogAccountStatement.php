<?php

declare(strict_types=1);

namespace App\Listeners\Account;

use App\Events\Account\ServicePaid;
use App\Models\AccountStatement;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;

/**
 * Logs service payments to AccountStatement for unified bank statement.
 *
 * Listens to ServicePaid event and creates AccountStatement entry.
 * Works generically for any service (Campaign, Subscription, Order, etc).
 */
class LogAccountStatement implements ShouldQueue
{
    /**
     * Handle the event.
     */
    public function handle(ServicePaid $event): void
    {
        try {
            // Verificar se já existe um statement para este serviço (idempotência)
            $exists = AccountStatement::where('statementable_type', get_class($event->service))
                ->where('statementable_id', $event->service->id)
                ->where('type', 'service_payment')
                ->where('category', $event->category)
                ->exists();

            if ($exists) {
                Log::info('AccountStatement for service payment already exists (skipping)', [
                    'service_type' => get_class($event->service),
                    'service_id' => $event->service->id,
                    'category' => $event->category,
                ]);
                return;
            }

            // Determine payment method
            $paymentMethod = $this->resolvePaymentMethod($event);

            $statement = AccountStatement::create([
                'user_id' => $event->service->user_id,
                'statementable_type' => get_class($event->service),
                'statementable_id' => $event->service->id,
                'type' => 'service_payment',
                'category' => $event->category,
                'amount' => -$event->calculation->grandTotal, // Negativo (saída)
                'wallet_amount' => -$event->calculation->walletAmount,
                'gateway_amount' => -$event->calculation->remainingAmount,
                'payment_method' => $paymentMethod,
                'gateway' => $event->payment?->gateway,
                'payment_id' => $event->payment?->uuid,
                'status' => $event->status,
                'description' => $this->buildDescription($event),
                'meta' => $event->calculation->toArray(),
                'completed_at' => $event->status === 'completed' ? now() : null,
            ]);

            Log::info('Account statement logged for service payment', [
                'statement_id' => $statement->id,
                'service_type' => get_class($event->service),
                'service_id' => $event->service->id,
                'category' => $event->category,
                'amount' => $event->calculation->grandTotal,
                'status' => $event->status,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to log account statement', [
                'service_type' => get_class($event->service),
                'service_id' => $event->service->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            // Don't throw - logging failure shouldn't break payment flow
        }
    }

    /**
     * Build human-readable description.
     */
    protected function buildDescription(ServicePaid $event): string
    {
        $serviceName = class_basename($event->service);
        $name = $event->service->name ?? $event->service->title ?? "#{$event->service->id}";

        return match ($event->category) {
            'campaign_payment' => "Pagamento Campanha: {$name}",
            'subscription_fee' => "Assinatura: {$name}",
            'ad_spend' => "Tráfego Pago: {$name}",
            'marketplace_order' => "Compra: {$name}",
            default => "Pagamento {$serviceName}: {$name}",
        };
    }

    /**
     * Resolve payment method from event.
     */
    protected function resolvePaymentMethod(ServicePaid $event): string
    {
        // Wallet-only payment
        if ($event->calculation->isWalletOnly()) {
            return 'wallet';
        }

        // Mixed payment (wallet + gateway)
        if ($event->calculation->isMixed()) {
            return 'mixed';
        }

        // Gateway-only payment
        return $event->payment?->payment_method?->value ?? 'unknown';
    }
}
