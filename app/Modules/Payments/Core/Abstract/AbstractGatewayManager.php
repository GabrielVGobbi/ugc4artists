<?php

declare(strict_types=1);

namespace App\Modules\Payments\Core\Abstract;

use App\Modules\Payments\Core\Contracts\ConfigurationInterface;
use App\Modules\Payments\Core\Contracts\CustomerServiceInterface;
use App\Modules\Payments\Core\Contracts\GatewayManagerInterface;
use App\Modules\Payments\Core\Contracts\PaymentServiceInterface;
use App\Modules\Payments\Core\Contracts\SplitServiceInterface;
use App\Modules\Payments\Core\Contracts\SubscriptionServiceInterface;
use App\Modules\Payments\Core\Contracts\TransferServiceInterface;
use App\Modules\Payments\Core\Traits\HasHttpClient;
use App\Modules\Payments\Core\Traits\HasLogging;
use App\Modules\Payments\Exceptions\GatewayUnavailableException;

/**
 * Abstract base class for gateway managers.
 * Uses lazy loading for services to optimize performance.
 */
abstract class AbstractGatewayManager implements GatewayManagerInterface
{
    use HasHttpClient;
    use HasLogging;

    protected ConfigurationInterface $configuration;

    protected ?CustomerServiceInterface $customersService = null;

    protected ?PaymentServiceInterface $paymentsService = null;

    protected ?SubscriptionServiceInterface $subscriptionsService = null;

    protected ?TransferServiceInterface $transfersService = null;

    protected ?SplitServiceInterface $splitsService = null;

    public function __construct(ConfigurationInterface $configuration)
    {
        $this->configuration = $configuration;
    }

    public function name(): string
    {
        return $this->configuration->getName();
    }

    protected function getGatewayName(): string
    {
        return $this->name();
    }

    protected function getConfiguration(): ConfigurationInterface
    {
        return $this->configuration;
    }

    public function customers(): CustomerServiceInterface
    {
        $this->ensureFeatureEnabled('customers');

        if ($this->customersService === null) {
            $this->customersService = $this->createCustomersService();
        }

        return $this->customersService;
    }

    public function payments(): PaymentServiceInterface
    {
        $this->ensureFeatureEnabled('payments');

        if ($this->paymentsService === null) {
            $this->paymentsService = $this->createPaymentsService();
        }

        return $this->paymentsService;
    }

    public function subscriptions(): SubscriptionServiceInterface
    {
        $this->ensureFeatureEnabled('subscriptions');

        if ($this->subscriptionsService === null) {
            $this->subscriptionsService = $this->createSubscriptionsService();
        }

        return $this->subscriptionsService;
    }

    public function transfers(): TransferServiceInterface
    {
        $this->ensureFeatureEnabled('transfers');

        if ($this->transfersService === null) {
            $this->transfersService = $this->createTransfersService();
        }

        return $this->transfersService;
    }

    public function splits(): SplitServiceInterface
    {
        $this->ensureFeatureEnabled('splits');

        if ($this->splitsService === null) {
            $this->splitsService = $this->createSplitsService();
        }

        return $this->splitsService;
    }

    public function isAvailable(): bool
    {
        try {
            $response = $this->httpClient()
                ->timeout(5)
                ->get($this->getHealthCheckEndpoint());

            return $response->successful();
        } catch (\Throwable) {
            return false;
        }
    }

    public function supportsFeature(string $feature): bool
    {
        return $this->configuration->isFeatureEnabled($feature);
    }

    public function getSupportedFeatures(): array
    {
        return $this->configuration->getFeatures();
    }

    protected function ensureFeatureEnabled(string $feature): void
    {
        if (! $this->supportsFeature($feature)) {
            throw new GatewayUnavailableException(
                gateway: $this->name(),
                message: "Feature '{$feature}' is not enabled for gateway '{$this->name()}'.",
            );
        }
    }

    protected function ensureApiKeyConfigured(): void
    {
        if (empty($this->configuration->getApiKey())) {
            throw new GatewayUnavailableException(
                gateway: $this->name(),
                message: "API key not configured for gateway '{$this->name()}'.",
            );
        }
    }

    /**
     * Get the health check endpoint.
     */
    abstract protected function getHealthCheckEndpoint(): string;

    /**
     * Get the default headers for API requests.
     */
    abstract protected function getDefaultHeaders(): array;

    /**
     * Create the customers service instance.
     */
    abstract protected function createCustomersService(): CustomerServiceInterface;

    /**
     * Create the payments service instance.
     */
    abstract protected function createPaymentsService(): PaymentServiceInterface;

    /**
     * Create the subscriptions service instance.
     */
    abstract protected function createSubscriptionsService(): SubscriptionServiceInterface;

    /**
     * Create the transfers service instance.
     */
    abstract protected function createTransfersService(): TransferServiceInterface;

    /**
     * Create the splits service instance.
     */
    abstract protected function createSplitsService(): SplitServiceInterface;
}
