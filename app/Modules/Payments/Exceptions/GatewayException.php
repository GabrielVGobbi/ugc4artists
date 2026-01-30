<?php

declare(strict_types=1);

namespace App\Modules\Payments\Exceptions;

use Throwable;

class GatewayException extends PaymentException
{
    public function __construct(
        string $message = 'Erro na comunicação com o gateway de pagamento.',
        int $code = 0,
        ?Throwable $previous = null,
        ?string $paymentUuid = null,
        public readonly ?string $gateway = null,
        public readonly ?int $httpStatusCode = null,
        public readonly ?array $gatewayResponse = null,
        array $context = [],
    ) {
        parent::__construct($message, $code, $previous, $paymentUuid, $context);
    }

    public function getContext(): array
    {
        return array_merge(parent::getContext(), [
            'gateway' => $this->gateway,
            'http_status_code' => $this->httpStatusCode,
            'gateway_response' => $this->gatewayResponse,
        ]);
    }

    public static function fromResponse(
        string $gateway,
        int $httpStatusCode,
        ?array $response = null,
        ?string $paymentUuid = null,
    ): self {
        $message = self::extractErrorMessage($response, $gateway, $httpStatusCode);

        return new self(
            message: $message,
            code: $httpStatusCode,
            gateway: $gateway,
            httpStatusCode: $httpStatusCode,
            gatewayResponse: $response,
            paymentUuid: $paymentUuid,
        );
    }

    /**
     * Extract error message from gateway response.
     * Handles different response formats from various gateways.
     */
    protected static function extractErrorMessage(?array $response, string $gateway, int $httpStatusCode): string
    {
        if ($response === null) {
            return "Erro HTTP {$httpStatusCode} do gateway {$gateway}.";
        }

        // Asaas format: { "errors": [{ "code": "...", "description": "..." }] }
        if (isset($response['errors']) && is_array($response['errors'])) {
            $errorMessages = [];
            foreach ($response['errors'] as $error) {
                if (isset($error['description'])) {
                    $errorMessages[] = $error['description'];
                } elseif (isset($error['message'])) {
                    $errorMessages[] = $error['message'];
                } elseif (is_string($error)) {
                    $errorMessages[] = $error;
                }
            }

            if (! empty($errorMessages)) {
                return implode(' | ', $errorMessages);
            }
        }

        // Iugu format: { "errors": { "field": ["message"] } } or { "errors": "message" }
        if (isset($response['errors'])) {
            if (is_string($response['errors'])) {
                return $response['errors'];
            }

            if (is_array($response['errors'])) {
                $errorMessages = [];
                foreach ($response['errors'] as $field => $messages) {
                    if (is_array($messages)) {
                        foreach ($messages as $msg) {
                            $errorMessages[] = is_numeric($field) ? $msg : "{$field}: {$msg}";
                        }
                    } elseif (is_string($messages)) {
                        $errorMessages[] = is_numeric($field) ? $messages : "{$field}: {$messages}";
                    }
                }

                if (! empty($errorMessages)) {
                    return implode(' | ', $errorMessages);
                }
            }
        }

        // Common formats
        if (isset($response['message'])) {
            return $response['message'];
        }

        if (isset($response['error'])) {
            return is_string($response['error']) ? $response['error'] : json_encode($response['error']);
        }

        if (isset($response['error_description'])) {
            return $response['error_description'];
        }

        return "Erro HTTP {$httpStatusCode} do gateway {$gateway}.";
    }

    /**
     * Get formatted error details for logging or display.
     */
    public function getErrorDetails(): array
    {
        $details = [
            'message' => $this->getMessage(),
            'gateway' => $this->gateway,
            'http_status' => $this->httpStatusCode,
        ];

        if ($this->gatewayResponse) {
            // Extract error codes if available (useful for Asaas)
            if (isset($this->gatewayResponse['errors']) && is_array($this->gatewayResponse['errors'])) {
                $codes = [];
                foreach ($this->gatewayResponse['errors'] as $error) {
                    if (isset($error['code'])) {
                        $codes[] = $error['code'];
                    }
                }
                if (! empty($codes)) {
                    $details['error_codes'] = $codes;
                }
            }

            $details['raw_response'] = $this->gatewayResponse;
        }

        return $details;
    }

    /**
     * Get user-friendly error message.
     */
    public function getUserMessage(): string
    {
        // Map common error codes to user-friendly messages
        $errorCodeMessages = [
            'invalid_customer.cpfCnpj' => 'CPF ou CNPJ do cliente é obrigatório para este tipo de cobrança.',
            'invalid_value' => 'O valor informado é inválido.',
            'invalid_dueDate' => 'A data de vencimento é inválida.',
            'invalid_billingType' => 'O método de pagamento selecionado não está disponível.',
            'invalid_customer' => 'Cliente não encontrado ou inválido.',
        ];

        if ($this->gatewayResponse && isset($this->gatewayResponse['errors']) && is_array($this->gatewayResponse['errors'])) {
            foreach ($this->gatewayResponse['errors'] as $error) {
                if (isset($error['code']) && isset($errorCodeMessages[$error['code']])) {
                    return $errorCodeMessages[$error['code']];
                }
            }
        }

        return $this->getMessage();
    }
}
