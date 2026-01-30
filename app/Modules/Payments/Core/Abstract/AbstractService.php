<?php

declare(strict_types=1);

namespace App\Modules\Payments\Core\Abstract;

use App\Modules\Payments\Core\Contracts\ConfigurationInterface;
use App\Modules\Payments\Core\Traits\HasHttpClient;
use App\Modules\Payments\Core\Traits\HasLogging;
use App\Modules\Payments\Exceptions\GatewayUnavailableException;

/**
 * Abstract base class for gateway domain services.
 */
abstract class AbstractService
{
    use HasHttpClient;
    use HasLogging;

    protected ConfigurationInterface $configuration;

    public function __construct(ConfigurationInterface $configuration)
    {
        $this->configuration = $configuration;
    }

    protected function getConfiguration(): ConfigurationInterface
    {
        return $this->configuration;
    }

    protected function getGatewayName(): string
    {
        return $this->configuration->getName();
    }

    protected function ensureApiKeyConfigured(): void
    {
        if (empty($this->configuration->getApiKey())) {
            throw new GatewayUnavailableException(
                gateway: $this->getGatewayName(),
                message: "API key not configured for gateway '{$this->getGatewayName()}'.",
            );
        }
    }

    /**
     * Get the default headers for API requests.
     */
    abstract protected function getDefaultHeaders(): array;
}
