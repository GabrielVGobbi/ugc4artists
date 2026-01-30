<?php

declare(strict_types=1);

namespace App\Modules\Payments\Exceptions;

use Throwable;

class GatewayUnavailableException extends GatewayException
{
    public function __construct(
        string $gateway,
        string $message = '',
        int $code = 503,
        ?Throwable $previous = null,
        ?string $paymentUuid = null,
        array $context = [],
    ) {
        $message = $message ?: "Gateway de pagamento '{$gateway}' está indisponível no momento.";

        parent::__construct(
            message: $message,
            code: $code,
            previous: $previous,
            paymentUuid: $paymentUuid,
            gateway: $gateway,
            context: $context,
        );
    }

    public static function timeout(string $gateway, ?string $paymentUuid = null): self
    {
        return new self(
            gateway: $gateway,
            message: "Timeout na comunicação com o gateway '{$gateway}'.",
            code: 504,
            paymentUuid: $paymentUuid,
        );
    }

    public static function connectionFailed(string $gateway, ?string $paymentUuid = null): self
    {
        return new self(
            gateway: $gateway,
            message: "Falha na conexão com o gateway '{$gateway}'.",
            code: 503,
            paymentUuid: $paymentUuid,
        );
    }
}
