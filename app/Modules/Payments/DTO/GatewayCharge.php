<?php

namespace App\Modules\Payments\DTO;

class GatewayCharge
{
    public function __construct(
        public readonly string $provider,
        public readonly string $reference,
        public readonly ?string $checkoutUrl = null,
        public readonly ?string $qrCodePayload = null,
        public readonly array $raw = [],
    ) {}
}
