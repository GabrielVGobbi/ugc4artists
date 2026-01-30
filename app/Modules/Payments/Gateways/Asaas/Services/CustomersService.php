<?php

declare(strict_types=1);

namespace App\Modules\Payments\Gateways\Asaas\Services;

use App\Modules\Payments\Core\Abstract\AbstractService;
use App\Modules\Payments\Core\Contracts\CustomerServiceInterface;
use App\Modules\Payments\Core\DTOs\Customer\CustomerCollection;
use App\Modules\Payments\Core\DTOs\Customer\CustomerRequest;
use App\Modules\Payments\Core\DTOs\Customer\CustomerResponse;
use App\Modules\Payments\Exceptions\PaymentConfigurationException;
use App\Modules\Payments\Gateways\Asaas\AsaasConfiguration;
use App\Modules\Payments\Gateways\Asaas\Mappers\CustomerMapper;
use Illuminate\Database\Eloquent\Model;

/**
 * Asaas customers service implementation.
 */
final class CustomersService extends AbstractService implements CustomerServiceInterface
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

    public function create(CustomerRequest $request): CustomerResponse
    {
        $this->ensureApiKeyConfigured();

        $payload = CustomerMapper::toAsaasPayload($request);
        $response = $this->httpPost('/customers', $payload);
        $data = $response->json();

        return CustomerMapper::fromAsaasResponse($data);
    }

    public function find(string $id): ?CustomerResponse
    {
        $this->ensureApiKeyConfigured();

        try {
            $response = $this->httpGet("/customers/{$id}");
            $data = $response->json();

            if (empty($data['id'])) {
                return null;
            }

            return CustomerMapper::fromAsaasResponse($data);
        } catch (\Throwable) {
            return null;
        }
    }

    public function findByExternalReference(string $externalReference): ?CustomerResponse
    {
        $this->ensureApiKeyConfigured();

        $response = $this->httpGet('/customers', ['externalReference' => $externalReference]);
        $data = $response->json();

        $customers = $data['data'] ?? [];

        if (empty($customers)) {
            return null;
        }

        return CustomerMapper::fromAsaasResponse($customers[0]);
    }

    public function findByEmail(string $email): ?CustomerResponse
    {
        $this->ensureApiKeyConfigured();

        $response = $this->httpGet('/customers', ['email' => $email]);
        $data = $response->json();

        $customers = $data['data'] ?? [];

        if (empty($customers)) {
            return null;
        }

        return CustomerMapper::fromAsaasResponse($customers[0]);
    }

    public function findByDocument(string $document): ?CustomerResponse
    {
        $this->ensureApiKeyConfigured();

        $cleanDocument = preg_replace('/\D/', '', $document);

        $response = $this->httpGet('/customers', ['cpfCnpj' => $cleanDocument]);
        $data = $response->json();

        $customers = $data['data'] ?? [];

        if (empty($customers)) {
            return null;
        }

        return CustomerMapper::fromAsaasResponse($customers[0]);
    }

    public function update(string $id, CustomerRequest $request): CustomerResponse
    {
        $this->ensureApiKeyConfigured();

        $payload = CustomerMapper::toAsaasPayload($request);

        $response = $this->httpPut("/customers/{$id}", $payload);
        $data = $response->json();

        return CustomerMapper::fromAsaasResponse($data);
    }

    public function delete(string $id): bool
    {
        $this->ensureApiKeyConfigured();

        try {
            $this->httpDelete("/customers/{$id}");

            return true;
        } catch (\Throwable) {
            return false;
        }
    }

    public function list(array $filters = []): CustomerCollection
    {
        $this->ensureApiKeyConfigured();

        $queryParams = $this->buildQueryParams($filters);

        $response = $this->httpGet('/customers', $queryParams);
        $data = $response->json();

        return CustomerMapper::toCollection($data);
    }

    /**
     * Find an existing customer or create a new one.
     *
     * This method will:
     * 1. Try to find by document (CPF/CNPJ)
     * 2. Try to find by email
     * 3. If not found, create a new customer
     * 4. Sync the external ID back to the local model if provided
     *
     * @param  CustomerRequest  $request
     * @param  Model|null  $model  Optional model to sync the external ID
     */
    public function firstOrCreate(CustomerRequest $request, ?Model $model = null): CustomerResponse
    {
        // Try to find by document first
        if ($request->document) {
            $existing = $this->findByDocument($request->document);
            if ($existing) {
                $this->syncExternalIdToModel($existing->id, $model);

                return $existing;
            }
        }

        // Try to find by email
        $existing = $this->findByEmail($request->email);
        if ($existing) {
            $this->syncExternalIdToModel($existing->id, $model);

            return $existing;
        }

        // Create new customer
        $created = $this->create($request);

        // Sync external ID to local model
        $this->syncExternalIdToModel($created->id, $model);

        return $created;
    }

    /**
     * Find or create a customer from a model.
     *
     * Convenience method that creates the CustomerRequest from the model
     * and automatically syncs the external ID.
     *
     * @param  Model  $model
     *
     * @throws PaymentConfigurationException
     */
    public function firstOrCreateFromModel(Model $model): CustomerResponse
    {
        // Validate the model implements the contract
        #if (! $model instanceof HasPaymentCustomerContract) {
        #    throw PaymentConfigurationException::invalidModel(get_class($model));
        #}

        // Check if model already has an external ID for this gateway
        $existingExternalId = $model->getPaymentExternalId('asaas');
        if ($existingExternalId) {
            // Try to find in the gateway
            $existing = $this->find($existingExternalId);
            if ($existing) {
                return $existing;
            }
        }

        // Create request from model
        $request = CustomerRequest::fromModel($model);

        return $this->firstOrCreate($request, $model);
    }

    /**
     * Sync the external gateway ID to a local model.
     *
     * @param  string  $externalId
     * @param  Model|null  $model
     */
    protected function syncExternalIdToModel(string $externalId, ?Model $model): void
    {
        $model->syncPaymentExternalId($externalId, 'asaas');
    }

    protected function buildQueryParams(array $filters): array
    {
        $params = [];

        if (isset($filters['name'])) {
            $params['name'] = $filters['name'];
        }

        if (isset($filters['email'])) {
            $params['email'] = $filters['email'];
        }

        if (isset($filters['document']) || isset($filters['cpfCnpj'])) {
            $params['cpfCnpj'] = preg_replace('/\D/', '', $filters['document'] ?? $filters['cpfCnpj']);
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
