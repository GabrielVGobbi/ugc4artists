<?php

declare(strict_types=1);

namespace App\Modules\Payments\Core\Contracts;

use App\Modules\Payments\Core\DTOs\Payment\ChargeCollection;
use App\Modules\Payments\Core\DTOs\Payment\ChargeRequest;
use App\Modules\Payments\Core\DTOs\Payment\ChargeResponse;
use App\Modules\Payments\Core\DTOs\Payment\CreditCardHolderRequest;
use App\Modules\Payments\Core\DTOs\Payment\CreditCardRequest;
use App\Modules\Payments\Core\DTOs\Payment\PixQrCodeResponse;
use App\Modules\Payments\Core\DTOs\Payment\RefundRequest;
use App\Modules\Payments\Core\DTOs\Payment\RefundResponse;
use App\Modules\Payments\Enums\PaymentMethod;

/**
 * Interface for payment/charge services.
 */
interface PaymentServiceInterface
{
    /**
     * Create a new charge/payment.
     */
    public function createCharge(ChargeRequest $request): ChargeResponse;

    /**
     * Find a charge by ID.
     */
    public function find(string $id): ?ChargeResponse;

    /**
     * Find a charge by external reference.
     */
    public function findByExternalReference(string $externalReference): ?ChargeResponse;

    /**
     * List charges with optional filters.
     *
     * @param array<string, mixed> $filters
     */
    public function list(array $filters = []): ChargeCollection;

    /**
     * List charges for a specific customer.
     *
     * @param array<string, mixed> $filters
     */
    public function listByCustomer(string $customerId, array $filters = []): ChargeCollection;

    /**
     * Cancel/delete a charge.
     */
    public function cancel(string $id): bool;

    /**
     * Get the PIX QR code for a charge.
     */
    public function getPixQrCode(string $chargeId): ?PixQrCodeResponse;

    /**
     * Refund a charge (total or partial).
     */
    public function refund(string $id, ?RefundRequest $request = null): RefundResponse;

    /**
     * Check if partial refund is supported.
     */
    public function supportsPartialRefund(): bool;

    /**
     * Get supported payment methods.
     *
     * @return PaymentMethod[]
     */
    public function getSupportedMethods(): array;

    /**
     * Check if a payment method is supported.
     */
    public function supportsMethod(PaymentMethod $method): bool;

    /**
     * Pay an existing charge with credit card.
     */
    public function payWithCreditCard(
        string $paymentId,
        CreditCardRequest $card,
        CreditCardHolderRequest $holder
    ): ChargeResponse;

    /**
     * Get the status of a payment.
     */
    public function getStatus(string $id): ?string;
}
