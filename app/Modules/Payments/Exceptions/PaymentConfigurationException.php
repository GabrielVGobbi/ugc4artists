<?php

declare(strict_types=1);

namespace App\Modules\Payments\Exceptions;

use Exception;

/**
 * Exception thrown when payment module configuration is invalid.
 */
class PaymentConfigurationException extends Exception
{
    /**
     * Create exception for missing column.
     */
    public static function missingColumn(string $table, string $column, string $gateway): self
    {
        return new self(
            "The column '{$column}' does not exist in table '{$table}'. " .
            "Please run the migration to add this column or configure a different column name in config/payments.php " .
            "under 'gateways.{$gateway}.customer.column_external_id'. " .
            "You can generate the migration by running: php artisan payments:install"
        );
    }

    /**
     * Create exception for missing configuration.
     */
    public static function missingConfig(string $key, string $gateway): self
    {
        return new self(
            "Missing configuration '{$key}' for gateway '{$gateway}'. " .
            "Please check your config/payments.php file."
        );
    }

    /**
     * Create exception for invalid model.
     */
    public static function invalidModel(string $model): self
    {
        return new self(
            "The model '{$model}' must implement HasPaymentCustomerContract " .
            "and use the HasPayments trait to work with the payment module."
        );
    }

    /**
     * Create exception for unsupported gateway.
     */
    public static function unsupportedGateway(string $gateway): self
    {
        return new self(
            "The gateway '{$gateway}' is not configured or not supported. " .
            "Please check your config/payments.php file."
        );
    }

    /**
     * Create exception for missing API key.
     */
    public static function missingApiKey(string $gateway): self
    {
        return new self(
            "No API key configured for gateway '{$gateway}'. " .
            "Please set the API key in your .env file."
        );
    }
}
