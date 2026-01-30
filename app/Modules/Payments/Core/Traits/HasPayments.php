<?php

declare(strict_types=1);

namespace App\Modules\Payments\Core\Traits;

use App\Modules\Payments\Exceptions\PaymentConfigurationException;
use App\Modules\Payments\Models\Payment;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;

/**
 * Trait for models that can be payment customers.
 *
 * This trait provides methods to manage external gateway IDs
 * and integrates with the payment module's customer services.
 *
 * @mixin \Illuminate\Database\Eloquent\Model
 */
trait HasPayments
{
    /**
     * Boot the trait.
     */
    public static function bootHasPayments(): void
    {
        // Validate column exists on first model access
        #static::retrieved(function ($model) {
        #    if ($model instanceof HasPaymentCustomerContract) {
        #        $model->validatePaymentColumnExists();
        #    }
        #});
    }

    /**
     * Get the relationship for payments.
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class, 'user_id');
    }

    /**
     * Get the column name for storing the external gateway ID.
     *
     * @param  string|null  $gateway  The gateway name (e.g., 'asaas', 'iugu')
     */
    public function getPaymentExternalIdColumn(?string $gateway = null): string
    {
        $gateway = $gateway ?? $this->getDefaultPaymentGateway();

        $column = config("payments.gateways.{$gateway}.customer.column_external_id");

        if (empty($column)) {
            // Fallback to convention: {gateway}_id (e.g., asaas_id, iugu_id)
            $column = "{$gateway}_id";
        }

        return $column;
    }

    /**
     * Get the external gateway customer ID.
     *
     * @param  string|null  $gateway  The gateway name
     */
    public function getPaymentExternalId(?string $gateway = null): ?string
    {
        $column = $this->getPaymentExternalIdColumn($gateway);

        if (! $this->hasPaymentColumn($column)) {
            return null;
        }

        return $this->getAttribute($column);
    }

    /**
     * Set the external gateway customer ID.
     *
     * @param  string  $externalId  The external ID from the gateway
     * @param  string|null  $gateway  The gateway name
     *
     * @throws PaymentConfigurationException
     */
    public function setPaymentExternalId(string $externalId, ?string $gateway = null): void
    {
        $gateway = $gateway ?? $this->getDefaultPaymentGateway();
        $column = $this->getPaymentExternalIdColumn($gateway);

        $this->ensurePaymentColumnExists($column, $gateway);

        $this->setAttribute($column, $externalId);
    }

    /**
     * Check if the model has an external gateway ID.
     *
     * @param  string|null  $gateway  The gateway name
     */
    public function hasPaymentExternalId(?string $gateway = null): bool
    {
        return ! empty($this->getPaymentExternalId($gateway));
    }

    /**
     * Sync the external gateway ID after creating a customer in the gateway.
     *
     * @param  string  $externalId  The external ID from the gateway
     * @param  string|null  $gateway  The gateway name
     * @return bool Whether the sync was successful
     *
     * @throws PaymentConfigurationException
     */
    public function syncPaymentExternalId(string $externalId, ?string $gateway = null): bool
    {
        $gateway = $gateway ?? $this->getDefaultPaymentGateway();
        $column = $this->getPaymentExternalIdColumn($gateway);

        $this->ensurePaymentColumnExists($column, $gateway);

        $this->setAttribute($column, $externalId);

        return $this->save();
    }

    /**
     * Get the default payment gateway from config.
     */
    public function getDefaultPaymentGateway(): string
    {
        return config('payments.default', 'asaas');
    }

    /**
     * Get all configured payment gateway columns for this model.
     *
     * @return array<string, string> ['gateway' => 'column_name']
     */
    public function getPaymentExternalIdColumns(): array
    {
        $gateways = config('payments.gateways', []);
        $columns = [];

        foreach ($gateways as $gateway => $config) {
            if (isset($config['enabled']) && $config['enabled']) {
                $columns[$gateway] = $this->getPaymentExternalIdColumn($gateway);
            }
        }

        return $columns;
    }

    /**
     * Check if the model has a specific payment column.
     */
    protected function hasPaymentColumn(string $column): bool
    {
        $table = $this->getTable();
        $cacheKey = "payments.column_exists.{$table}.{$column}";

        return Cache::remember($cacheKey, now()->addHours(24), function () use ($table, $column) {
            return Schema::hasColumn($table, $column);
        });
    }

    /**
     * Ensure the payment column exists in the database.
     *
     * @throws PaymentConfigurationException
     */
    protected function ensurePaymentColumnExists(string $column, string $gateway): void
    {
        if (! $this->hasPaymentColumn($column)) {
            throw PaymentConfigurationException::missingColumn(
                $this->getTable(),
                $column,
                $gateway
            );
        }
    }

    /**
     * Validate that the payment column exists (called on boot).
     *
     * This is a soft validation that logs a warning instead of throwing.
     */
    protected function validatePaymentColumnExists(): void
    {
        $gateway = $this->getDefaultPaymentGateway();
        $column = $this->getPaymentExternalIdColumn($gateway);

        if (! $this->hasPaymentColumn($column)) {
            // Log warning instead of throwing to avoid breaking the app
            logger()->warning(
                "Payment module: Column '{$column}' does not exist in table '{$this->getTable()}'. " .
                    "Run 'php artisan payments:install' to create the necessary migrations."
            );
        }
    }

    /**
     * Clear the cached column check.
     */
    public static function clearPaymentColumnCache(): void
    {
        $model = new static();
        $gateways = config('payments.gateways', []);

        foreach ($gateways as $gateway => $config) {
            $column = $model->getPaymentExternalIdColumn($gateway);
            Cache::forget("payments.column_exists.{$model->getTable()}.{$column}");
        }
    }
}
