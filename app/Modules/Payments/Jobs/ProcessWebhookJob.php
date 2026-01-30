<?php

declare(strict_types=1);

namespace App\Modules\Payments\Jobs;

use App\Modules\Payments\Enums\PaymentEventType;
use App\Modules\Payments\GatewayManager;
use App\Modules\Payments\Models\Payment;
use App\Modules\Payments\Models\WebhookEvent;
use App\Modules\Payments\Services\SettlementService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessWebhookJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $backoff = 30;

    public function __construct(public int $webhookEventId) {}

    public function handle(GatewayManager $gateways, SettlementService $settlement): void
    {
        $event = WebhookEvent::find($this->webhookEventId);

        if (! $event) {
            $this->logWarning('Webhook event not found', ['id' => $this->webhookEventId]);
            return;
        }

        if ($event->processed_at) {
            $this->logInfo('Webhook already processed', ['id' => $event->id]);
            return;
        }

        try {
            $gateway = $gateways->driver($event->provider);
            $parsed = $gateway->parseWebhook($event->payload, $event->headers ?? []);

            $payment = $this->findPayment($parsed->paymentUuid, $event);

            if ($payment) {
                $this->processPaymentEvent($payment, $parsed->type, $event->provider, $settlement, $event);
            }

            $this->markAsProcessed($event, $parsed->paymentUuid);
        } catch (\Throwable $e) {
            $this->logError('Webhook processing failed', [
                'event_id' => $event->id,
                'provider' => $event->provider,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    protected function findPayment(?string $paymentUuid, WebhookEvent $event): ?Payment
    {
        if ($paymentUuid) {
            return Payment::where('uuid', $paymentUuid)->first();
        }

        $gatewayReference = $this->extractGatewayReference($event->payload);

        if ($gatewayReference) {
            return Payment::where('gateway_reference', $gatewayReference)->first();
        }

        return null;
    }

    protected function extractGatewayReference(array $payload): ?string
    {
        return $payload['payment']['id']
            ?? $payload['data']['id']
            ?? $payload['id']
            ?? null;
    }

    protected function processPaymentEvent(
        Payment $payment,
        string $providerEventType,
        string $provider,
        SettlementService $settlement,
        WebhookEvent $event,
    ): void {
        $eventType = PaymentEventType::fromProviderEvent($provider, $providerEventType);
        $context = ['provider_event' => $event->payload, 'webhook_event_id' => $event->id];

        $this->logInfo('Processing payment event', [
            'payment_uuid' => $payment->uuid,
            'provider' => $provider,
            'provider_event_type' => $providerEventType,
            'mapped_event_type' => $eventType->value,
        ]);

        match (true) {
            $eventType->isSuccessful() => $settlement->markPaid($payment, $context),
            $eventType === PaymentEventType::PAYMENT_CANCELED => $settlement->markFailed($payment, 'canceled', $context),
            $eventType->isFailed() => $settlement->markFailed($payment, 'failed', $context),
            default => $this->logInfo('Unhandled event type', [
                'event_type' => $eventType->value,
                'payment_uuid' => $payment->uuid,
            ]),
        };
    }

    protected function markAsProcessed(WebhookEvent $event, ?string $paymentUuid): void
    {
        $updateData = ['processed_at' => now()];

        if ($paymentUuid && ! $event->payment_uuid) {
            $updateData['payment_uuid'] = $paymentUuid;
        }

        $event->update($updateData);
    }

    protected function logInfo(string $message, array $context = []): void
    {
        Log::channel(config('payments.logging.channel', 'stack'))
            ->info("[Webhook] {$message}", $context);
    }

    protected function logWarning(string $message, array $context = []): void
    {
        Log::channel(config('payments.logging.channel', 'stack'))
            ->warning("[Webhook] {$message}", $context);
    }

    protected function logError(string $message, array $context = []): void
    {
        Log::channel(config('payments.logging.channel', 'stack'))
            ->error("[Webhook] {$message}", $context);
    }
}
