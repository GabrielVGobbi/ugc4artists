<?php

declare(strict_types=1);

namespace App\Modules\Payments\Core\Traits;

use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Trait for structured logging functionality.
 */
trait HasLogging
{
    abstract protected function getGatewayName(): string;

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
        ?string $context = null,
    ): void {
        if (! $this->shouldLog()) {
            return;
        }

        Log::channel($this->getLogChannel())->log($this->getLogLevel(), '[Gateway] Request', [
            'gateway' => $this->getGatewayName(),
            'method' => strtoupper($method),
            'endpoint' => $endpoint,
            'context' => $context,
            'data' => $this->sanitizeLogData($data),
        ]);
    }

    protected function logResponse(
        Response $response,
        string $endpoint,
        ?string $context = null,
    ): void {
        if (! $this->shouldLog()) {
            return;
        }

        $level = $response->successful() ? $this->getLogLevel() : 'warning';

        Log::channel($this->getLogChannel())->log($level, '[Gateway] Response', [
            'gateway' => $this->getGatewayName(),
            'endpoint' => $endpoint,
            'context' => $context,
            'status' => $response->status(),
            'successful' => $response->successful(),
            'body' => $this->sanitizeLogData($response->json() ?? []),
        ]);
    }

    protected function logError(
        Throwable $exception,
        string $endpoint,
        ?string $context = null,
    ): void {
        Log::channel($this->getLogChannel())->error('[Gateway] Error', [
            'gateway' => $this->getGatewayName(),
            'endpoint' => $endpoint,
            'context' => $context,
            'exception' => get_class($exception),
            'message' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString(),
        ]);
    }

    protected function logWebhook(
        string $eventType,
        array $payload,
        ?string $context = null,
        bool $verified = true,
    ): void {
        if (! $this->shouldLog()) {
            return;
        }

        $level = $verified ? 'info' : 'warning';

        Log::channel($this->getLogChannel())->log($level, '[Gateway] Webhook', [
            'gateway' => $this->getGatewayName(),
            'event_type' => $eventType,
            'context' => $context,
            'verified' => $verified,
            'payload' => $this->sanitizeLogData($payload),
        ]);
    }

    protected function logInfo(string $message, array $context = []): void
    {
        if (! $this->shouldLog()) {
            return;
        }

        Log::channel($this->getLogChannel())->info("[Gateway] {$message}", array_merge([
            'gateway' => $this->getGatewayName(),
        ], $context));
    }

    protected function logWarning(string $message, array $context = []): void
    {
        Log::channel($this->getLogChannel())->warning("[Gateway] {$message}", array_merge([
            'gateway' => $this->getGatewayName(),
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
            'cpfCnpj',
            'cpf_cnpj',
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
