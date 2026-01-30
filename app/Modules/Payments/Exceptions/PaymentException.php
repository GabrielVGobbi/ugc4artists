<?php

declare(strict_types=1);

namespace App\Modules\Payments\Exceptions;

use Exception;
use Throwable;

class PaymentException extends Exception
{
    public function __construct(
        string $message = 'Erro no processamento do pagamento.',
        int $code = 0,
        ?Throwable $previous = null,
        public readonly ?string $paymentUuid = null,
        public readonly array $context = [],
    ) {
        parent::__construct($message, $code, $previous);
    }

    public function getContext(): array
    {
        return array_merge($this->context, [
            'payment_uuid' => $this->paymentUuid,
        ]);
    }
}
