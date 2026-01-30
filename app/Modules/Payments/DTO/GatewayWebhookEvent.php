<?php

namespace App\Modules\Payments\DTO;

class GatewayWebhookEvent
{
    public function __construct(
        public readonly string $provider,
        public readonly string $providerEventId,
        public readonly ?string $paymentUuid,
        public readonly string $type, // succeeded|failed|canceled|refunded|...
        public readonly array $raw = [],
    ) {}
}
