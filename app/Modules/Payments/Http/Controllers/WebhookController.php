<?php

declare(strict_types=1);

namespace App\Modules\Payments\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Payments\Exceptions\WebhookVerificationException;
use App\Modules\Payments\Webhooks\WebhookDispatcher;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Controller for handling payment gateway webhooks.
 *
 * This controller receives webhooks from payment gateways (Asaas, Iugu, etc.)
 * and routes them to the appropriate handler for processing.
 */
class WebhookController extends Controller
{
    public function __construct(
        private WebhookDispatcher $dispatcher,
    ) {}

    /**
     * Handle incoming webhook from payment gateway.
     *
     * @param  Request  $request  The incoming HTTP request
     * @param  string  $provider  The payment provider (e.g., 'asaas', 'iugu')
     */
    public function handle(Request $request, string $provider): JsonResponse
    {
        $provider = strtolower($provider);

        try {
            // Check if handler exists for this provider
            if (! $this->dispatcher->hasHandler($provider)) {
                $this->logWarning("No handler registered for provider: {$provider}", [
                    'ip' => $request->ip(),
                ]);

                return response()->json([
                    'success' => false,
                    'error' => 'Unknown provider',
                ], 400);
            }

            // Dispatch the webhook for processing
            $webhookEvent = $this->dispatcher->dispatch($provider, $request);

            return response()->json([
                'success' => true,
                'webhook_id' => $webhookEvent->id,
                'processed' => $webhookEvent->processed_at !== null,
            ]);
        } catch (WebhookVerificationException $e) {
            $this->logWarning("Webhook verification failed: {$e->getMessage()}", [
                'provider' => $provider,
                'ip' => $request->ip(),
            ]);

            // Return 401 for authentication failures
            return response()->json([
                'success' => false,
                'error' => 'Verification failed',
            ], 401);
        } catch (Throwable $e) {
            $this->logError("Webhook processing error: {$e->getMessage()}", [
                'provider' => $provider,
                'ip' => $request->ip(),
                'exception' => get_class($e),
            ]);

            // Return 200 to prevent retries for unrecoverable errors
            // but indicate failure in the response
            return response()->json([
                'success' => false,
                'error' => 'Processing error',
            ]);
        }
    }

    /**
     * Health check endpoint for webhook configuration.
     */
    public function health(Request $request, string $provider): JsonResponse
    {
        $provider = strtolower($provider);

        return response()->json([
            'status' => 'ok',
            'provider' => $provider,
            'handler_registered' => $this->dispatcher->hasHandler($provider),
            'timestamp' => now()->toISOString(),
        ]);
    }

    private function logWarning(string $message, array $context = []): void
    {
        Log::channel(config('payments.logging.channel', 'stack'))
            ->warning("[WebhookController] {$message}", $context);
    }

    private function logError(string $message, array $context = []): void
    {
        Log::channel(config('payments.logging.channel', 'stack'))
            ->error("[WebhookController] {$message}", $context);
    }
}
