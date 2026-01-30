<?php

declare(strict_types=1);

namespace App\Modules\Payments\Gateways\Asaas\Services;

use App\Modules\Payments\Core\Abstract\AbstractService;
use App\Modules\Payments\Core\Contracts\TransferServiceInterface;
use App\Modules\Payments\Core\DTOs\Transfer\TransferCollection;
use App\Modules\Payments\Core\DTOs\Transfer\TransferRequest;
use App\Modules\Payments\Core\DTOs\Transfer\TransferResponse;
use App\Modules\Payments\Gateways\Asaas\AsaasConfiguration;
use App\Modules\Payments\Gateways\Asaas\Mappers\TransferMapper;

/**
 * Asaas transfers service implementation.
 */
final class TransfersService extends AbstractService implements TransferServiceInterface
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

    public function create(TransferRequest $request): TransferResponse
    {
        $this->ensureApiKeyConfigured();

        $payload = TransferMapper::toAsaasPayload($request);

        $response = $this->httpPost('/transfers', $payload);
        $data = $response->json();

        return TransferMapper::fromAsaasResponse($data);
    }

    public function find(string $id): ?TransferResponse
    {
        $this->ensureApiKeyConfigured();

        try {
            $response = $this->httpGet("/transfers/{$id}");
            $data = $response->json();

            if (empty($data['id'])) {
                return null;
            }

            return TransferMapper::fromAsaasResponse($data);
        } catch (\Throwable) {
            return null;
        }
    }

    public function cancel(string $id): bool
    {
        $this->ensureApiKeyConfigured();

        try {
            $this->httpDelete("/transfers/{$id}");

            return true;
        } catch (\Throwable) {
            return false;
        }
    }

    public function list(array $filters = []): TransferCollection
    {
        $this->ensureApiKeyConfigured();

        $queryParams = $this->buildQueryParams($filters);

        $response = $this->httpGet('/transfers', $queryParams);
        $data = $response->json();

        return TransferMapper::toCollection($data);
    }

    public function getAvailableBalance(): int
    {
        $this->ensureApiKeyConfigured();

        $response = $this->httpGet('/finance/balance');
        $data = $response->json();

        // Return balance in cents
        return (int) (($data['balance'] ?? 0) * 100);
    }

    public function isEnabled(): bool
    {
        try {
            $balance = $this->getAvailableBalance();

            return $balance >= 0;
        } catch (\Throwable) {
            return false;
        }
    }

    /**
     * Create a PIX transfer using a PIX key.
     */
    public function createPixTransfer(int $amountCents, string $pixKey, ?string $description = null): TransferResponse
    {
        return $this->create(new TransferRequest(
            amountCents: $amountCents,
            pixKey: $pixKey,
            type: 'PIX',
            description: $description,
        ));
    }

    /**
     * Create a transfer to another Asaas wallet.
     */
    public function createWalletTransfer(int $amountCents, string $walletId, ?string $description = null): TransferResponse
    {
        return $this->create(new TransferRequest(
            amountCents: $amountCents,
            walletId: $walletId,
            type: 'ASAAS',
            description: $description,
        ));
    }

    protected function buildQueryParams(array $filters): array
    {
        $params = [];

        if (isset($filters['type'])) {
            $params['type'] = strtoupper($filters['type']);
        }

        if (isset($filters['status'])) {
            $params['status'] = strtoupper($filters['status']);
        }

        if (isset($filters['date_start'])) {
            $params['dateCreated[ge]'] = $filters['date_start'];
        }

        if (isset($filters['date_end'])) {
            $params['dateCreated[le]'] = $filters['date_end'];
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
