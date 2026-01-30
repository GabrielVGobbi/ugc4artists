<?php

declare(strict_types=1);

namespace App\Modules\Payments\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Resources\PaymentResource;
use App\Modules\Payments\Enums\PaymentMethod;
use App\Modules\Payments\Enums\PaymentStatus;
use App\Modules\Payments\Gateways\Asaas\AsaasManager;
use App\Modules\Payments\Models\Payment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

/**
 * Controller for payment pages.
 */
class PaymentController extends Controller
{
    public function __construct(
        private AsaasManager $asaas,
    ) {}

    /**
     * List user payments with pagination (API).
     */
    public function payments(Request $request)
    {
        $user = $request->user();

        $payments = Payment::where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 15));

        return PaymentResource::collection($payments);
    }

    /**
     * Show a payment.
     *
     * If payment is pending and method is PIX, shows the PIX payment screen.
     * If payment is paid, shows success screen.
     * If payment is failed/canceled, shows error screen.
     */
    public function show(Request $request, string $uuid): InertiaResponse
    {
        $payment = Payment::where('uuid', $uuid)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        // Prepare base payment data
        $paymentData = $this->formatPaymentData($payment);

        // Handle different states
        return match (true) {
            $payment->status === PaymentStatus::PAID => $this->renderSuccess($payment, $paymentData),
            $payment->status->isFinal() => $this->renderFailed($payment, $paymentData),
            $payment->payment_method === PaymentMethod::PIX => $this->renderPixPayment($payment, $paymentData),
            $payment->payment_method === PaymentMethod::CREDIT_CARD => $this->renderCardPayment($payment, $paymentData),
            default => $this->renderPending($payment, $paymentData),
        };
    }

    /**
     * Check payment status (for polling).
     */
    public function status(Request $request, string $uuid): \Illuminate\Http\JsonResponse
    {
        $payment = Payment::where('uuid', $uuid)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        // Optionally refresh from gateway if pending
        if ($payment->status->isPending() && $payment->gateway_reference) {
            #$this->refreshPaymentStatus($payment);
        }

        return response()->json([
            'uuid' => $payment->uuid,
            'status' => $payment->status->value,
            'status_label' => $payment->status->getLabelText(),
            'status_color' => $payment->status->getLabelColor(),
            'is_paid' => $payment->status === PaymentStatus::PAID,
            'is_pending' => $payment->status->isPending(),
            'is_final' => $payment->status->isFinal(),
            'paid_at' => $payment->paid_at?->toISOString(),
        ]);
    }

    /**
     * Render PIX payment screen.
     */
    private function renderPixPayment(Payment $payment, array $paymentData): InertiaResponse
    {
        $pixData = null;

        // Get PIX QR code data from stored meta (no API call needed)
        if ($payment->pix_payload || $payment->pix_image) {
            $pixData = [
                'payload' => $payment->pix_payload,
                'encoded_image' => $payment->pix_image,
                'expires_at' => $payment->pix_expires_at,
            ];
        }

        // Fallback to stored data if available
        if (! $pixData && isset($payment->gateway_data['pix'])) {
            $pixData = [
                'payload' => $payment->gateway_data['pix']['payload'] ?? null,
                'encoded_image' => $payment->gateway_data['pix']['encodedImage'] ?? null,
                'expires_at' => $payment->gateway_data['pix']['expirationDate'] ?? null,
            ];
        }

        return Inertia::render('app/payments/show-pix', [
            'payment' => $paymentData,
            'pix' => $pixData,
        ]);
    }

    /**
     * Render credit card payment screen.
     */
    private function renderCardPayment(Payment $payment, array $paymentData): InertiaResponse
    {
        return Inertia::render('app/payments/show-card', [
            'payment' => $paymentData,
        ]);
    }

    /**
     * Render generic pending screen.
     */
    private function renderPending(Payment $payment, array $paymentData): InertiaResponse
    {
        return Inertia::render('app/payments/show', [
            'payment' => $paymentData,
        ]);
    }

    /**
     * Render success screen.
     */
    private function renderSuccess(Payment $payment, array $paymentData): InertiaResponse
    {
        return Inertia::render('app/payments/success', [
            'payment' => $paymentData,
        ]);
    }

    /**
     * Render failed/canceled screen.
     */
    private function renderFailed(Payment $payment, array $paymentData): InertiaResponse
    {
        return Inertia::render('app/payments/failed', [
            'payment' => $paymentData,
        ]);
    }

    /**
     * Format payment data for frontend.
     */
    private function formatPaymentData(Payment $payment): array
    {
        return [
            'uuid' => $payment->uuid,
            'amount' => $payment->amount_cents,
            'amount_cents' => $payment->amount_cents,
            'amount_formatted' => toCurrency($payment->amount_cents / 100),
            'wallet_applied' => $payment->wallet_applied_cents,
            'wallet_applied_formatted' => toCurrency($payment->wallet_applied_cents / 100),
            'gateway_amount' => $payment->gateway_amount_cents,
            'gateway_amount_formatted' => toCurrency($payment->gateway_amount_cents / 100),
            'status' => $payment->status->value,
            'status_label' => $payment->status->getLabelText(),
            'status_color' => $payment->status->getLabelColor(),
            'status_icon' => $payment->status->getIcon(),
            'payment_method' => $payment->payment_method?->value,
            'payment_method_label' => $payment->payment_method?->getLabelText(),
            'payment_method_icon' => $payment->payment_method?->getIcon(),
            'gateway' => $payment->gateway,
            'due_date' => $payment->due_date?->format('d/m/Y'),
            'due_date_iso' => $payment->due_date?->toISOString(),
            'paid_at' => $payment->paid_at?->format('d/m/Y H:i'),
            'created_at' => $payment->created_at->format('d/m/Y H:i'),
            'description' => $payment->meta['description'] ?? null,
            'billable_type' => $payment->billable_type,
            'is_pending' => $payment->status->isPending(),
            'is_paid' => $payment->status === PaymentStatus::PAID,
            'is_final' => $payment->status->isFinal(),
        ];
    }

    /**
     * Format cents to BRL currency.
     */
    private function formatCurrency(int $cents): string
    {
        return 'R$ ' . number_format($cents / 100, 2, ',', '.');
    }

    /**
     * Refresh payment status from gateway.
     */
    private function refreshPaymentStatus(Payment $payment): void
    {
        try {
            $gatewayPayment = $this->asaas->payments()->find($payment->gateway_reference);

            if ($gatewayPayment && $gatewayPayment->status) {
                // Map gateway status to our status
                $newStatus = $this->mapGatewayStatus($gatewayPayment->status);

                if ($newStatus && $newStatus !== $payment->status) {
                    $payment->update(['status' => $newStatus]);

                    if ($newStatus === PaymentStatus::PAID) {
                        $payment->update(['paid_at' => now()]);
                    }
                }
            }
        } catch (\Throwable $e) {
            // Log but don't fail the request
            logger()->warning('Failed to refresh payment status', [
                'payment_uuid' => $payment->uuid,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Map gateway status string to PaymentStatus enum.
     */
    private function mapGatewayStatus(string $gatewayStatus): ?PaymentStatus
    {
        return match (strtoupper($gatewayStatus)) {
            'PENDING', 'AWAITING_RISK_ANALYSIS' => PaymentStatus::PENDING,
            'CONFIRMED', 'RECEIVED' => PaymentStatus::PAID,
            'OVERDUE' => PaymentStatus::FAILED,
            'REFUNDED', 'REFUND_REQUESTED', 'REFUND_IN_PROGRESS' => PaymentStatus::REFUNDED,
            'DELETED' => PaymentStatus::CANCELED,
            default => null,
        };
    }
}
