<?php

namespace App\Modules\Payments\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Payments\Http\Requests\CreatePaymentRequest;
use App\Modules\Payments\Services\CheckoutService;
use App\Modules\Payments\Services\SettlementService;

class CheckoutController extends Controller
{
    public function __construct(
        private CheckoutService $checkout,
        private SettlementService $settlement,
    ) {}

    public function store(CreatePaymentRequest $request)
    {
        $user = $request->user();

        $payment = $this->checkout->create($request->validated(), $user);

        // Caso 100% wallet, settle imediato (sem gateway)
        if ($payment->gateway_amount_cents === 0) {
            $this->settlement->markPaid($payment, ['wallet_only' => true]);
            $payment->refresh();
        }

        return response()->json([
            'payment' => [
                'uuid' => $payment->uuid,
                'status' => $payment->status->value,
                'amount_cents' => $payment->amount_cents,
                'wallet_applied_cents' => $payment->wallet_applied_cents,
                'gateway_amount_cents' => $payment->gateway_amount_cents,
                'gateway' => $payment->gateway,
                'gateway_reference' => $payment->gateway_reference,
                'checkout_url' => $payment->meta['gateway']['checkout_url'] ?? null,
                'qr_code_payload' => $payment->meta['gateway']['qr_code_payload'] ?? null,
            ],
        ]);
    }
}
