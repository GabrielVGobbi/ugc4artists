<?php

declare(strict_types=1);

namespace App\Modules\Payments\Gateways\Asaas;

use App\Modules\Payments\Core\Abstract\AbstractConfiguration;

/**
 * Asaas gateway configuration.
 */
final class AsaasConfiguration extends AbstractConfiguration
{
    protected const SANDBOX_URL = 'https://sandbox.asaas.com/api/v3';

    protected const PRODUCTION_URL = 'https://api.asaas.com/v3';

    public function getName(): string
    {
        return 'asaas';
    }

    public function getBaseUrl(): string
    {
        return $this->isSandbox() ? self::SANDBOX_URL : self::PRODUCTION_URL;
    }

    public function getWebhookSecret(): ?string
    {
        return $this->config['webhook_secret'] ?? null;
    }

    public function getDefaultHeaders(): array
    {
        return [
            'access_token' => $this->getApiKey(),
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
        ];
    }
}
