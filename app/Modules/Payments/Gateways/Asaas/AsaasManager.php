<?php

declare(strict_types=1);

namespace App\Modules\Payments\Gateways\Asaas;

use App\Modules\Payments\Core\Abstract\AbstractGatewayManager;
use App\Modules\Payments\Core\Contracts\CustomerServiceInterface;
use App\Modules\Payments\Core\Contracts\PaymentServiceInterface;
use App\Modules\Payments\Core\Contracts\SplitServiceInterface;
use App\Modules\Payments\Core\Contracts\SubscriptionServiceInterface;
use App\Modules\Payments\Core\Contracts\TransferServiceInterface;
use App\Modules\Payments\Gateways\Asaas\Services\CustomersService;
use App\Modules\Payments\Gateways\Asaas\Services\PaymentsService;
use App\Modules\Payments\Gateways\Asaas\Services\SplitsService;
use App\Modules\Payments\Gateways\Asaas\Services\SubscriptionsService;
use App\Modules\Payments\Gateways\Asaas\Services\TransfersService;
use App\Modules\Payments\Gateways\Asaas\Services\WebhooksService;

/**
 * Asaas gateway manager.
 * Provides access to all Asaas API services with lazy loading.
 */
final class AsaasManager extends AbstractGatewayManager
{
    public function __construct(?AsaasConfiguration $configuration = null)
    {
        parent::__construct($configuration ?? new AsaasConfiguration());
    }

    protected function getHealthCheckEndpoint(): string
    {
        return '/finance/balance';
    }

    protected function getDefaultHeaders(): array
    {
        /** @var AsaasConfiguration $config */
        $config = $this->configuration;

        return $config->getDefaultHeaders();
    }

    protected function createCustomersService(): CustomerServiceInterface
    {
        /** @var AsaasConfiguration $config */
        $config = $this->configuration;

        return new CustomersService($config);
    }

    protected function createPaymentsService(): PaymentServiceInterface
    {
        /** @var AsaasConfiguration $config */
        $config = $this->configuration;

        return new PaymentsService($config);
    }

    protected function createSubscriptionsService(): SubscriptionServiceInterface
    {
        /** @var AsaasConfiguration $config */
        $config = $this->configuration;

        return new SubscriptionsService($config);
    }

    protected function createTransfersService(): TransferServiceInterface
    {
        /** @var AsaasConfiguration $config */
        $config = $this->configuration;

        return new TransfersService($config);
    }

    protected function createSplitsService(): SplitServiceInterface
    {
        /** @var AsaasConfiguration $config */
        $config = $this->configuration;

        return new SplitsService($config);
    }

    /**
     * Get account balance information.
     *
     * @return array{balance: float, pending: float}
     */
    public function getBalance(): array
    {
        $this->ensureApiKeyConfigured();

        $response = $this->httpGet('/finance/balance');
        $data = $response->json();

        return [
            'balance' => (float) ($data['balance'] ?? 0),
            'pending' => (float) ($data['pendingBalance'] ?? 0),
        ];
    }

    /**
     * Get account information.
     */
    public function getAccountInfo(): array
    {
        $this->ensureApiKeyConfigured();

        $response = $this->httpGet('/myAccount/commercialInfo');

        return $response->json() ?? [];
    }

    /**
     * Get webhooks service.
     */
    public function webhooks(): WebhooksService
    {
        if (! isset($this->services['webhooks'])) {
            /** @var AsaasConfiguration $config */
            $config = $this->configuration;
            $this->services['webhooks'] = new WebhooksService($config);
        }

        return $this->services['webhooks'];
    }

    public function getColumnExternalId(): string
    {
        return config('payments.gateways.asaas.customer.column_external_id');
    }
}
