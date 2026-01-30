<?php

declare(strict_types=1);

namespace App\Modules\Payments\Core\Contracts;

use App\Modules\Payments\Core\DTOs\Customer\CustomerCollection;
use App\Modules\Payments\Core\DTOs\Customer\CustomerRequest;
use App\Modules\Payments\Core\DTOs\Customer\CustomerResponse;
use Illuminate\Database\Eloquent\Model;

/**
 * Interface for customer management services.
 */
interface CustomerServiceInterface
{
    /**
     * Create a new customer.
     */
    public function create(CustomerRequest $request): CustomerResponse;

    /**
     * Find a customer by ID.
     */
    public function find(string $id): ?CustomerResponse;

    /**
     * Find a customer by external reference.
     */
    public function findByExternalReference(string $externalReference): ?CustomerResponse;

    /**
     * Find a customer by email.
     */
    public function findByEmail(string $email): ?CustomerResponse;

    /**
     * Find a customer by document (CPF/CNPJ).
     */
    public function findByDocument(string $document): ?CustomerResponse;

    /**
     * Update an existing customer.
     */
    public function update(string $id, CustomerRequest $request): CustomerResponse;

    /**
     * Delete a customer.
     */
    public function delete(string $id): bool;

    /**
     * List customers with optional filters.
     *
     * @param array<string, mixed> $filters
     */
    public function list(array $filters = []): CustomerCollection;

    /**
     * Find or create a customer based on the request data.
     * Uses email or document to find existing customer.
     */
    public function firstOrCreate(CustomerRequest $request, Model $model): CustomerResponse;
}
