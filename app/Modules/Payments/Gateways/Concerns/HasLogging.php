<?php

declare(strict_types=1);

namespace App\Modules\Payments\Gateways\Concerns;

use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Log;
use Throwable;

trait HasLogging
{
    protected function getLogChannel(): string
    {
        return config('payments.logging.channel', config('logging.default'));
    }

    protected function getLogLevel(): string
    {
        return config('payments.logging.level', 'debug');
    }

    protected function shouldLog(): bool
    {
        return config('payments.logging.enabled', true);
    }

    protected function logRequest(
        string $method,
        string $endpoint,
        array $data = [],
        ?string $paymentUuid = null,
    ): void {
        if (! $this->shouldLog()) {
            return;
        }

        Log::channel($this->getLogChannel())->log($this->getLogLevel(), 'Payment gateway request', [
            'gateway' => $this->name(),
            'method' => strtoupper($method),
            'endpoint' => $endpoint,
            'payment_uuid' => $paymentUuid,
            'data' => $this->sanitizeLogData($data),
        ]);
    }

    protected function logResponse(
        Response $response,
        string $endpoint,
        ?string $paymentUuid = null,
    ): void {
        if (! $this->shouldLog()) {
            return;
        }

        $level = $response->successful() ? $this->getLogLevel() : 'warning';

        Log::channel($this->getLogChannel())->log($level, 'Payment gateway response', [
            'gateway' => $this->name(),
            'endpoint' => $endpoint,
            'payment_uuid' => $paymentUuid,
            'status' => $response->status(),
            'successful' => $response->successful(),
            'body' => $this->sanitizeLogData($response->json() ?? []),
        ]);
    }

    protected function logError(
        Throwable $exception,
        string $endpoint,
        ?string $paymentUuid = null,
    ): void {
        Log::channel($this->getLogChannel())->error('Payment gateway error', [
            'gateway' => $this->name(),
            'endpoint' => $endpoint,
            'payment_uuid' => $paymentUuid,
            'exception' => get_class($exception),
            'message' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString(),
        ]);
    }

    protected function logWebhook(
        string $eventType,
        array $payload,
        ?string $paymentUuid = null,
        bool $verified = true,
    ): void {
        if (! $this->shouldLog()) {
            return;
        }

        $level = $verified ? 'info' : 'warning';

        Log::channel($this->getLogChannel())->log($level, 'Payment webhook received', [
            'gateway' => $this->name(),
            'event_type' => $eventType,
            'payment_uuid' => $paymentUuid,
            'verified' => $verified,
            'payload' => $this->sanitizeLogData($payload),
        ]);
    }

    protected function logSettlement(
        string $action,
        ?string $paymentUuid,
        array $context = [],
    ): void {
        if (! $this->shouldLog()) {
            return;
        }

        Log::channel($this->getLogChannel())->info("Payment {$action}", array_merge([
            'gateway' => $this->name(),
            'payment_uuid' => $paymentUuid,
        ], $context));
    }

    protected function sanitizeLogData(array $data): array
    {
        $sensitiveKeys = [
            'api_key',
            'api_secret',
            'token',
            'secret',
            'password',
            'access_token',
            'refresh_token',
            'card_number',
            'cvv',
            'cvc',
            'security_code',
            'cpf',
            'cnpj',
        ];

        return collect($data)->map(function ($value, $key) use ($sensitiveKeys) {
            if (is_array($value)) {
                return $this->sanitizeLogData($value);
            }

            foreach ($sensitiveKeys as $sensitiveKey) {
                if (stripos((string) $key, $sensitiveKey) !== false) {
                    return '[REDACTED]';
                }
            }

            return $value;
        })->all();
    }
}
