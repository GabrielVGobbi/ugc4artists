<?php

declare(strict_types=1);

namespace App\Modules\Payments\Contracts;

use App\Modules\Payments\DTO\GatewayCharge;
use App\Modules\Payments\DTO\GatewayWebhookEvent;
use App\Modules\Payments\Enums\PaymentMethod;
use App\Modules\Payments\Models\Payment;

interface PaymentGatewayInterface
{
    public function name(): string;

    public function createCharge(Payment $payment): GatewayCharge;

    public function getCharge(string $reference): ?GatewayCharge;

    public function cancelCharge(Payment $payment): void;

    public function verifyWebhook(array $payload, array $headers): bool;

    public function parseWebhook(array $payload, array $headers): GatewayWebhookEvent;

    /**
     * @return PaymentMethod[]
     */
    public function getSupportedMethods(): array;

    public function supportsMethod(PaymentMethod $method): bool;

    public function isAvailable(): bool;
}
