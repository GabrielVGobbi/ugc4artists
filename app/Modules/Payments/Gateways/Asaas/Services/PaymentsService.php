<?php

declare(strict_types=1);

namespace App\Modules\Payments\Gateways\Asaas\Services;

use App\Modules\Payments\Core\Abstract\AbstractService;
use App\Modules\Payments\Core\Contracts\PaymentServiceInterface;
use App\Modules\Payments\Core\DTOs\Payment\ChargeCollection;
use App\Modules\Payments\Core\DTOs\Payment\ChargeRequest;
use App\Modules\Payments\Core\DTOs\Payment\ChargeResponse;
use App\Modules\Payments\Core\DTOs\Payment\CreditCardHolderRequest;
use App\Modules\Payments\Core\DTOs\Payment\CreditCardRequest;
use App\Modules\Payments\Core\DTOs\Payment\PixQrCodeResponse;
use App\Modules\Payments\Core\DTOs\Payment\RefundRequest;
use App\Modules\Payments\Core\DTOs\Payment\RefundResponse;
use App\Modules\Payments\Enums\PaymentMethod;
use App\Modules\Payments\Gateways\Asaas\AsaasConfiguration;
use App\Modules\Payments\Gateways\Asaas\Mappers\PaymentMapper;

/**
 * Asaas payments service implementation.
 */
final class PaymentsService extends AbstractService implements PaymentServiceInterface
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

    public function createCharge(ChargeRequest $request): ChargeResponse
    {
        $this->ensureApiKeyConfigured();

        $payload = PaymentMapper::toAsaasPayload($request);

        $response = $this->httpPost('/payments', $payload, $request->externalReference);
        $data = $response->json();

        // If PIX, get QR code
        if ($request->method === PaymentMethod::PIX && isset($data['id'])) {
            $pixData = $this->fetchPixQrCode($data['id']);
            if ($pixData) {
                $data['pix'] = $pixData;
            }
        }

        // Attach request payload to response for history tracking
        return PaymentMapper::fromAsaasResponse($data)->withRequestPayload($payload);
    }

    public function find(string $id): ?ChargeResponse
    {
        $this->ensureApiKeyConfigured();

        try {
            $response = $this->httpGet("/payments/{$id}");
            $data = $response->json();

            if (empty($data['id'])) {
                return null;
            }

            return PaymentMapper::fromAsaasResponse($data);
        } catch (\Throwable) {
            return null;
        }
    }

    public function findByExternalReference(string $externalReference): ?ChargeResponse
    {
        $this->ensureApiKeyConfigured();

        $response = $this->httpGet('/payments', ['externalReference' => $externalReference]);
        $data = $response->json();

        $payments = $data['data'] ?? [];

        if (empty($payments)) {
            return null;
        }

        return PaymentMapper::fromAsaasResponse($payments[0]);
    }

    public function list(array $filters = []): ChargeCollection
    {
        $this->ensureApiKeyConfigured();

        $queryParams = $this->buildQueryParams($filters);

        $response = $this->httpGet('/payments', $queryParams);
        $data = $response->json();

        return PaymentMapper::toCollection($data);
    }

    public function listByCustomer(string $customerId, array $filters = []): ChargeCollection
    {
        $filters['customer'] = $customerId;

        return $this->list($filters);
    }

    public function cancel(string $id): bool
    {
        $this->ensureApiKeyConfigured();

        try {
            $this->httpDelete("/payments/{$id}");

            return true;
        } catch (\Throwable) {
            return false;
        }
    }

    public function getPixQrCode(string $chargeId): ?PixQrCodeResponse
    {
        $this->ensureApiKeyConfigured();

        $data = $this->fetchPixQrCode($chargeId);

        if (! $data) {
            return null;
        }

        return PixQrCodeResponse::fromArray($data);
    }

    public function refund(string $id, ?RefundRequest $request = null): RefundResponse
    {
        $this->ensureApiKeyConfigured();

        $payload = [];

        if ($request && $request->amountCents !== null) {
            $payload['value'] = $request->amountCents / 100;
        }

        if ($request && $request->description !== null) {
            $payload['description'] = $request->description;
        }

        // Get original payment to determine refund amount
        $originalPayment = $this->find($id);
        $originalAmountCents = $originalPayment?->amountCents ?? 0;

        $response = $this->httpPost("/payments/{$id}/refund", $payload);
        $data = $response->json();

        return PaymentMapper::toRefundResponse($data, $originalAmountCents);
    }

    public function supportsPartialRefund(): bool
    {
        return true;
    }

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

    /**
     * Restore a deleted/canceled payment.
     */
    public function restore(string $id): ChargeResponse
    {
        $this->ensureApiKeyConfigured();

        $response = $this->httpPost("/payments/{$id}/restore");
        $data = $response->json();

        return PaymentMapper::fromAsaasResponse($data);
    }

    /**
     * Get payment status.
     */
    public function getStatus(string $id): ?string
    {
        $this->ensureApiKeyConfigured();

        try {
            $response = $this->httpGet("/payments/{$id}/status");
            $data = $response->json();

            return $data['status'] ?? null;
        } catch (\Throwable) {
            return null;
        }
    }

    /**
     * Pay an existing charge with credit card.
     *
     * This method is used to pay a charge that was created without credit card data.
     * The charge must be in PENDING status.
     */
    public function payWithCreditCard(
        string $paymentId,
        CreditCardRequest $card,
        CreditCardHolderRequest $holder
    ): ChargeResponse {
        $this->ensureApiKeyConfigured();

        $payload = [
            'creditCard' => [
                'holderName' => $card->holderName,
                'number' => preg_replace('/\D/', '', $card->number),
                'expiryMonth' => $card->expiryMonth,
                'expiryYear' => $card->expiryYear,
                'ccv' => $card->cvv,
            ],
            'creditCardHolderInfo' => [
                'name' => $holder->name,
                'email' => $holder->email,
                'cpfCnpj' => preg_replace('/\D/', '', $holder->document),
                'postalCode' => preg_replace('/\D/', '', $holder->address?->postalCode ?? ''),
                'addressNumber' => $holder->address?->number ?? '',
                'phone' => $holder->phone ? preg_replace('/\D/', '', $holder->phone) : null,
            ],
        ];

        // Remove null values from creditCardHolderInfo
        $payload['creditCardHolderInfo'] = array_filter(
            $payload['creditCardHolderInfo'],
            fn($value) => $value !== null && $value !== ''
        );

        $response = $this->httpPost("/payments/{$paymentId}/payWithCreditCard", $payload, $paymentId);
        $data = $response->json();

        // Mask sensitive card data before storing
        $maskedPayload = $this->maskSensitiveCardData($payload);

        return PaymentMapper::fromAsaasResponse($data)->withRequestPayload($maskedPayload);
    }

    /**
     * Mask sensitive credit card data for safe storage.
     */
    private function maskSensitiveCardData(array $payload): array
    {
        if (isset($payload['creditCard']['number'])) {
            $number = $payload['creditCard']['number'];
            $payload['creditCard']['number'] = str_repeat('*', max(0, strlen($number) - 4)) . substr($number, -4);
        }

        if (isset($payload['creditCard']['ccv'])) {
            $payload['creditCard']['ccv'] = '***';
        }

        return $payload;
    }

    protected function fetchPixQrCode(string $paymentId): ?array
    {
        try {
            $response = $this->httpGet("/payments/{$paymentId}/pixQrCode");

            return $response->json();
        } catch (\Throwable) {
            return null;
        }
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

        if (isset($filters['billing_type']) || isset($filters['method'])) {
            $params['billingType'] = strtoupper($filters['billing_type'] ?? $filters['method']);
        }

        if (isset($filters['external_reference']) || isset($filters['externalReference'])) {
            $params['externalReference'] = $filters['external_reference'] ?? $filters['externalReference'];
        }

        if (isset($filters['due_date_start'])) {
            $params['dueDate[ge]'] = $filters['due_date_start'];
        }

        if (isset($filters['due_date_end'])) {
            $params['dueDate[le]'] = $filters['due_date_end'];
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
