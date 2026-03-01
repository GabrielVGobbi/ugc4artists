<?php

declare(strict_types=1);

namespace App\Events\Account;

use App\Modules\Payments\Models\Payment;
use App\Services\Campaign\ValueObjects\CheckoutCalculation;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Generic event for any service payment.
 *
 * Fired when a user pays for any service (Campaign, Subscription, Order, etc).
 * This allows AccountStatement to log all service payments generically.
 */
class ServicePaid
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly Model $service,                         // Campaign, Subscription, Order, etc
        public readonly ?Payment $payment,                       // Payment do gateway (null se wallet-only)
        public readonly CheckoutCalculation $calculation,        // Breakdown de valores
        public readonly string $category,                        // campaign_payment, subscription_fee, etc
        public readonly string $status,                          // completed, pending
        public readonly array $context = [],
    ) {}
}
