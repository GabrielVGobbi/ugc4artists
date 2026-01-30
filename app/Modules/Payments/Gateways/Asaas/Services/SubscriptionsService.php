<?php

declare(strict_types=1);

namespace App\Modules\Payments\Gateways\Asaas\Services;

use App\Modules\Payments\Core\Abstract\AbstractService;
use App\Modules\Payments\Core\Contracts\SubscriptionServiceInterface;
use App\Modules\Payments\Core\DTOs\Subscription\SubscriptionCollection;
use App\Modules\Payments\Core\DTOs\Subscription\SubscriptionRequest;
use App\Modules\Payments\Core\DTOs\Subscription\SubscriptionResponse;
use App\Modules\Payments\Gateways\Asaas\AsaasConfiguration;
use App\Modules\Payments\Gateways\Asaas\Mappers\SubscriptionMapper;

/**
 * Asaas subscriptions service implementation.
 */
final class SubscriptionsService extends AbstractService implements SubscriptionServiceInterface
{
    public function __construct(AsaasConfiguration $configuration)
    {
        parent::__construct($configuration);
    }

    protected function getDefaultHeaders(): array
    {
        /** @var AsaasConfiguration $config */
        $config = $this->configuration;

        return $config->getDefaultHeaders();
    }

    public function create(SubscriptionRequest $request): SubscriptionResponse
    {
        $this->ensureApiKeyConfigured();

        $payload = SubscriptionMapper::toAsaasPayload($request);

        $response = $this->httpPost('/subscriptions', $payload);
        $data = $response->json();

        return SubscriptionMapper::fromAsaasResponse($data);
    }

    public function find(string $id): ?SubscriptionResponse
    {
        $this->ensureApiKeyConfigured();

        try {
            $response = $this->httpGet("/subscriptions/{$id}");
            $data = $response->json();

            if (empty($data['id'])) {
                return null;
            }

            return SubscriptionMapper::fromAsaasResponse($data);
        } catch (\Throwable) {
            return null;
        }
    }

    public function findByExternalReference(string $externalReference): ?SubscriptionResponse
    {
        $this->ensureApiKeyConfigured();

        $response = $this->httpGet('/subscriptions', ['externalReference' => $externalReference]);
        $data = $response->json();

        $subscriptions = $data['data'] ?? [];

        if (empty($subscriptions)) {
            return null;
        }

        return SubscriptionMapper::fromAsaasResponse($subscriptions[0]);
    }

    public function update(string $id, SubscriptionRequest $request): SubscriptionResponse
    {
        $this->ensureApiKeyConfigured();

        $payload = SubscriptionMapper::toAsaasPayload($request);

        $response = $this->httpPut("/subscriptions/{$id}", $payload);
        $data = $response->json();

        return SubscriptionMapper::fromAsaasResponse($data);
    }

    public function cancel(string $id): bool
    {
        $this->ensureApiKeyConfigured();

        try {
            $this->httpDelete("/subscriptions/{$id}");

            return true;
        } catch (\Throwable) {
            return false;
        }
    }

    public function pause(string $id): SubscriptionResponse
    {
        $this->ensureApiKeyConfigured();

        // Asaas doesn't have a native pause, we update status
        $response = $this->httpPut("/subscriptions/{$id}", ['status' => 'INACTIVE']);
        $data = $response->json();

        return SubscriptionMapper::fromAsaasResponse($data);
    }

    public function resume(string $id): SubscriptionResponse
    {
        $this->ensureApiKeyConfigured();

        $response = $this->httpPut("/subscriptions/{$id}", ['status' => 'ACTIVE']);
        $data = $response->json();

        return SubscriptionMapper::fromAsaasResponse($data);
    }

    public function list(array $filters = []): SubscriptionCollection
    {
        $this->ensureApiKeyConfigured();

        $queryParams = $this->buildQueryParams($filters);

        $response = $this->httpGet('/subscriptions', $queryParams);
        $data = $response->json();

        return SubscriptionMapper::toCollection($data);
    }

    public function listByCustomer(string $customerId, array $filters = []): SubscriptionCollection
    {
        $filters['customer'] = $customerId;

        return $this->list($filters);
    }

    public function getPayments(string $subscriptionId): array
    {
        $this->ensureApiKeyConfigured();

        $response = $this->httpGet("/subscriptions/{$subscriptionId}/payments");
        $data = $response->json();

        return $data['data'] ?? [];
    }

    protected function buildQueryParams(array $filters): array
    {
        $params = [];

        if (isset($filters['customer']) || isset($filters['customer_id'])) {
            $params['customer'] = $filters['customer'] ?? $filters['customer_id'];
        }

        if (isset($filters['status'])) {
            $params['status'] = strtoupper($filters['status']);
        }

        if (isset($filters['billing_type']) || isset($filters['cycle'])) {
            $params['billingType'] = strtoupper($filters['billing_type'] ?? $filters['cycle']);
        }

        if (isset($filters['external_reference']) || isset($filters['externalReference'])) {
            $params['externalReference'] = $filters['external_reference'] ?? $filters['externalReference'];
        }

        if (isset($filters['limit'])) {
            $params['limit'] = min((int) $filters['limit'], 100);
        }

        if (isset($filters['offset'])) {
            $params['offset'] = (int) $filters['offset'];
        }

        return $params;
    }
}
