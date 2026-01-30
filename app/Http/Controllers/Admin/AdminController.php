<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Campaign;
use App\Modules\Payments\Core\DTOs\Payment\ChargeRequest;
use App\Modules\Payments\Enums\PaymentStatus;
use App\Modules\Payments\Facades\Checkout;
use App\Modules\Payments\Http\Requests\CreatePaymentRequest;
use App\Modules\Payments\Services\CheckoutService;
use App\Modules\Payments\Services\SettlementService;
use Inertia\Inertia;
use Inertia\Response;
use App\Modules\Payments\Facades\Asaas;
use App\Modules\Payments\Models\Payment;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function __construct(
        private CheckoutService $checkout,
        private SettlementService $settlement,
    ) {}

    /**
     */
    public function testeCheckout(CreatePaymentRequest $request)
    {
        $user = $request->user();

        $campaign = Campaign::create(['name' => 'teste']);

        $payment = Checkout::for($user)
            ->billable($campaign)
            ->amount(10000)
            ->pix()
            ->gateway('asaas')
            ->useWallet(true)
            ->create();

        dd($payment);

        $payment = $this->checkout->create($request->validated(), $user);

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

    public function testePagarTransaction(Request $request)
    {
        $externalId = $request->input('payment.id', null);
        $status = $request->input('event', null);


        $payment = Payment::with('billable')->where('gateway_reference', $externalId)->first();

        if ($status === 'PAYMENT_RECEIVED') {

            $this->settlement->markPaid($payment, []);
        }
    }
}
