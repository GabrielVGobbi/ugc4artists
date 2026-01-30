<?php

declare(strict_types=1);

namespace App\Modules\Payments\Exceptions;

use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class WebhookVerificationException extends PaymentException
{
    public function __construct(
        string $message = 'Falha na verificação do webhook.',
        int $code = 401,
        ?Throwable $previous = null,
        public readonly ?string $provider = null,
        public readonly ?string $reason = null,
        array $context = [],
    ) {
        parent::__construct($message, $code, $previous, context: $context);
    }

    public function render(Request $request): Response
    {
        return response()->json([
            'error' => 'Webhook verification failed',
            'message' => $this->message,
        ], $this->code);
    }

    public function getContext(): array
    {
        return array_merge(parent::getContext(), [
            'provider' => $this->provider,
            'reason' => $this->reason,
        ]);
    }

    public static function invalidSignature(string $provider): self
    {
        return new self(
            message: "Assinatura do webhook inválida para o provider '{$provider}'.",
            provider: $provider,
            reason: 'invalid_signature',
        );
    }

    public static function missingSignature(string $provider): self
    {
        return new self(
            message: "Assinatura do webhook ausente para o provider '{$provider}'.",
            provider: $provider,
            reason: 'missing_signature',
        );
    }

    public static function expiredTimestamp(string $provider): self
    {
        return new self(
            message: "Timestamp do webhook expirado para o provider '{$provider}'.",
            provider: $provider,
            reason: 'expired_timestamp',
        );
    }
}
