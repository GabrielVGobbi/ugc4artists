<?php

declare(strict_types=1);

namespace App\Modules\Payments\Gateways;

use App\Modules\Payments\Contracts\PaymentGatewayInterface;
use App\Modules\Payments\DTO\GatewayCharge;
use App\Modules\Payments\DTO\GatewayWebhookEvent;
use App\Modules\Payments\Enums\PaymentMethod;
use App\Modules\Payments\Exceptions\GatewayUnavailableException;
use App\Modules\Payments\Gateways\Concerns\HasHttpClient;
use App\Modules\Payments\Gateways\Concerns\HasLogging;
use App\Modules\Payments\Models\Payment;

abstract class BaseGateway implements PaymentGatewayInterface
{
    use HasHttpClient;
    use HasLogging;

    abstract public function name(): string;

    abstract public function createCharge(Payment $payment): GatewayCharge;

    abstract public function getCharge(string $reference): ?GatewayCharge;

    abstract public function cancelCharge(Payment $payment): void;

    abstract public function verifyWebhook(array $payload, array $headers): bool;

    abstract public function parseWebhook(array $payload, array $headers): GatewayWebhookEvent;

    abstract protected function baseUrl(): string;

    abstract protected function defaultHeaders(): array;

    /**
     * @return PaymentMethod[]
     */
    public function getSupportedMethods(): array
    {
        return [
            PaymentMethod::PIX,
            PaymentMethod::CREDIT_CARD,
            PaymentMethod::BOLETO,
        ];
    }

    public function supportsMethod(PaymentMethod $method): bool
    {
        return in_array($method, $this->getSupportedMethods(), true);
    }

    public function isAvailable(): bool
    {
        try {
            $response = $this->httpClient()
                ->timeout(5)
                ->get($this->healthCheckEndpoint());

            return $response->successful();
        } catch (\Throwable) {
            return false;
        }
    }

    protected function healthCheckEndpoint(): string
    {
        return '/';
    }

    protected function getGatewayConfig(): array
    {
        return config("payments.gateways.{$this->name()}", []);
    }

    protected function isSandbox(): bool
    {
        $config = $this->getGatewayConfig();

        return $config['sandbox'] ?? config('payments.test_mode', true);
    }

    protected function getApiKey(): ?string
    {
        return $this->getGatewayConfig()['api_key'] ?? null;
    }

    protected function getWebhookSecret(): ?string
    {
        $config = $this->getGatewayConfig();

        return $config['webhook_secret'] ?? $config['webhook_token'] ?? null;
    }

    protected function buildCustomerData(Payment $payment): array
    {
        $user = $payment->user;

        return [
            'name' => $user->name ?? 'Cliente',
            'email' => $user->email,
            'cpfCnpj' => $user->cpf ?? $user->document ?? null,
            'phone' => $user->phone ?? null,
        ];
    }

    protected function ensureApiKey(): void
    {
        if (empty($this->getApiKey())) {
            throw new GatewayUnavailableException(
                gateway: $this->name(),
                message: "API key não configurada para o gateway '{$this->name()}'.",
            );
        }
    }
}
