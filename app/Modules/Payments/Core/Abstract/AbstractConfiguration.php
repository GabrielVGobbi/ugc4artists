<?php

declare(strict_types=1);

namespace App\Modules\Payments\Core\Abstract;

use App\Modules\Payments\Core\Contracts\ConfigurationInterface;

/**
 * Abstract base configuration class for gateways.
 */
abstract class AbstractConfiguration implements ConfigurationInterface
{
    protected array $config;

    public function __construct()
    {
        $this->config = config("payments.gateways.{$this->getName()}", []);
    }

    abstract public function getName(): string;

    abstract public function getBaseUrl(): string;

    public function getApiKey(): ?string
    {
        return $this->config['api_key'] ?? null;
    }

    public function isSandbox(): bool
    {
        return $this->config['sandbox'] ?? config('payments.test_mode', true);
    }

    public function getWebhookSecret(): ?string
    {
        return $this->config['webhook_secret'] ?? $this->config['webhook_token'] ?? null;
    }

    public function getTimeout(): int
    {
        return $this->config['timeout'] ?? config('payments.timeout', 30);
    }

    public function getRetryConfig(): array
    {
        $retry = $this->config['retry'] ?? [];

        return [
            'attempts' => $retry['attempts'] ?? config('payments.retry_attempts', 3),
            'delay' => $retry['delay'] ?? config('payments.retry_delay', 100),
        ];
    }

    public function toArray(): array
    {
        return [
            'name' => $this->getName(),
            'base_url' => $this->getBaseUrl(),
            'sandbox' => $this->isSandbox(),
            'timeout' => $this->getTimeout(),
            'retry' => $this->getRetryConfig(),
            'features' => $this->getFeatures(),
        ];
    }

    public function isFeatureEnabled(string $feature): bool
    {
        $features = $this->getFeatures();

        return $features[$feature] ?? false;
    }

    public function getFeatures(): array
    {
        return $this->config['features'] ?? [
            'customers' => true,
            'payments' => true,
            'subscriptions' => true,
            'transfers' => true,
            'splits' => true,
        ];
    }

    public function isEnabled(): bool
    {
        return ($this->config['enabled'] ?? true) && ! empty($this->getApiKey());
    }

    protected function getConfigValue(string $key, mixed $default = null): mixed
    {
        return $this->config[$key] ?? $default;
    }
}
