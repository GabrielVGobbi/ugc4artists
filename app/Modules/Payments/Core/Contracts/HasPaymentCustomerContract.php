<?php

declare(strict_types=1);

namespace App\Modules\Payments\Core\Contracts;

/**
 * Contract for models that can be payment customers.
 *
 * Models implementing this interface can store external gateway IDs
 * and be used with the payment module's customer services.
 */
interface HasPaymentCustomerContract
{
    /**
     * Get the column name for storing the external gateway ID.
     *
     * @param  string|null  $gateway  The gateway name (e.g., 'asaas', 'iugu')
     */
    public function getPaymentExternalIdColumn(?string $gateway = null): string;

    /**
     * Get the external gateway customer ID.
     *
     * @param  string|null  $gateway  The gateway name
     */
    public function getPaymentExternalId(?string $gateway = null): ?string;

    /**
     * Set the external gateway customer ID.
     *
     * @param  string  $externalId  The external ID from the gateway
     * @param  string|null  $gateway  The gateway name
     */
    public function setPaymentExternalId(string $externalId, ?string $gateway = null): void;

    /**
     * Check if the model has an external gateway ID.
     *
     * @param  string|null  $gateway  The gateway name
     */
    public function hasPaymentExternalId(?string $gateway = null): bool;

    /**
     * Sync the external gateway ID after creating a customer in the gateway.
     *
     * @param  string  $externalId  The external ID from the gateway
     * @param  string|null  $gateway  The gateway name
     * @return bool Whether the sync was successful
     */
    public function syncPaymentExternalId(string $externalId, ?string $gateway = null): bool;
}
