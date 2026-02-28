<?php

declare(strict_types=1);

namespace App\Events\Campaign;

use App\Models\Campaign;
use App\Modules\Payments\Models\Payment;
use App\Services\Campaign\ValueObjects\CheckoutCalculation;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CampaignCheckoutCompleted
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly Campaign $campaign,
        public readonly ?Payment $payment,              // null for wallet-only
        public readonly CheckoutCalculation $calculation,
        public readonly string $checkoutType,           // 'wallet_only'|'mixed'|'gateway_only'
        public readonly string $status,                 // 'completed'|'pending'
        public readonly array $context = [],
    ) {}
}
