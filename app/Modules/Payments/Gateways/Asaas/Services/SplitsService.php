<?php

declare(strict_types=1);

namespace App\Modules\Payments\Gateways\Asaas\Services;

use App\Modules\Payments\Core\Abstract\AbstractService;
use App\Modules\Payments\Core\Contracts\SplitServiceInterface;
use App\Modules\Payments\Core\DTOs\Split\SplitCollection;
use App\Modules\Payments\Core\DTOs\Split\SplitRequest;
use App\Modules\Payments\Core\DTOs\Split\SplitResponse;
use App\Modules\Payments\Core\DTOs\Split\SplitRuleRequest;
use App\Modules\Payments\Gateways\Asaas\AsaasConfiguration;
use App\Modules\Payments\Gateways\Asaas\Mappers\SplitMapper;

/**
 * Asaas splits service implementation.
 */
final class SplitsService extends AbstractService implements SplitServiceInterface
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

    public function create(SplitRequest $request): SplitResponse
    {
        $this->ensureApiKeyConfigured();

        $payload = SplitMapper::toAsaasPayload($request);

        $response = $this->httpPost("/payments/{$request->paymentId}/split", $payload);
        $data = $response->json();

        // Build response with payment ID
        $data['payment'] = $request->paymentId;

        return SplitMapper::fromAsaasResponse($data);
    }

    public function find(string $id): ?SplitResponse
    {
        // Asaas doesn't have a direct split endpoint
        // Splits are attached to payments
        return $this->getByPayment($id);
    }

    public function update(string $id, SplitRequest $request): SplitResponse
    {
        $this->ensureApiKeyConfigured();

        $payload = SplitMapper::toAsaasPayload($request);

        $response = $this->httpPut("/payments/{$id}/split", $payload);
        $data = $response->json();

        $data['payment'] = $id;

        return SplitMapper::fromAsaasResponse($data);
    }

    public function delete(string $id): bool
    {
        $this->ensureApiKeyConfigured();

        try {
            $this->httpDelete("/payments/{$id}/split");

            return true;
        } catch (\Throwable) {
            return false;
        }
    }

    public function list(array $filters = []): SplitCollection
    {
        // Asaas doesn't have a list splits endpoint
        // This would need to be implemented by listing payments and filtering
        return new SplitCollection(items: [], total: 0);
    }

    public function addRule(string $paymentId, SplitRuleRequest $rule): SplitResponse
    {
        $this->ensureApiKeyConfigured();

        $payload = SplitMapper::ruleToAsaasPayload($rule);

        $response = $this->httpPost("/payments/{$paymentId}/split", ['split' => [$payload]]);
        $data = $response->json();

        $data['payment'] = $paymentId;

        return SplitMapper::fromAsaasResponse($data);
    }

    public function removeRule(string $paymentId, string $ruleId): bool
    {
        // In Asaas, we need to update the entire split configuration
        // without the specific rule
        return $this->delete($paymentId);
    }

    public function getByPayment(string $paymentId): ?SplitResponse
    {
        $this->ensureApiKeyConfigured();

        try {
            $response = $this->httpGet("/payments/{$paymentId}");
            $data = $response->json();

            if (empty($data['split'])) {
                return null;
            }

            $data['payment'] = $paymentId;

            return SplitMapper::fromAsaasResponse($data);
        } catch (\Throwable) {
            return null;
        }
    }

    public function isEnabled(): bool
    {
        // Splits are always enabled on Asaas
        return true;
    }

    /**
     * Create a split with percentage-based rules.
     *
     * @param  array<string, float>  $percentages  Wallet ID => percentage
     */
    public function createPercentageSplit(string $paymentId, array $percentages): SplitResponse
    {
        $rules = [];

        foreach ($percentages as $walletId => $percentage) {
            $rules[] = new SplitRuleRequest(
                walletId: $walletId,
                percentageValue: $percentage,
            );
        }

        return $this->create(new SplitRequest(
            paymentId: $paymentId,
            rules: $rules,
        ));
    }

    /**
     * Create a split with fixed value rules.
     *
     * @param  array<string, int>  $values  Wallet ID => value in cents
     */
    public function createFixedSplit(string $paymentId, array $values): SplitResponse
    {
        $rules = [];

        foreach ($values as $walletId => $valueCents) {
            $rules[] = new SplitRuleRequest(
                walletId: $walletId,
                fixedValueCents: $valueCents,
            );
        }

        return $this->create(new SplitRequest(
            paymentId: $paymentId,
            rules: $rules,
        ));
    }
}
