<?php

declare(strict_types=1);

namespace App\Modules\Payments\Core\Contracts;

use App\Modules\Payments\Core\DTOs\Transfer\TransferCollection;
use App\Modules\Payments\Core\DTOs\Transfer\TransferRequest;
use App\Modules\Payments\Core\DTOs\Transfer\TransferResponse;

/**
 * Interface for transfer/payout services.
 */
interface TransferServiceInterface
{
    /**
     * Create a new transfer/payout.
     */
    public function create(TransferRequest $request): TransferResponse;

    /**
     * Find a transfer by ID.
     */
    public function find(string $id): ?TransferResponse;

    /**
     * Cancel a pending transfer.
     */
    public function cancel(string $id): bool;

    /**
     * List transfers with optional filters.
     *
     * @param array<string, mixed> $filters
     */
    public function list(array $filters = []): TransferCollection;

    /**
     * Get the current available balance for transfers.
     */
    public function getAvailableBalance(): int;

    /**
     * Check if transfers are enabled for this account.
     */
    public function isEnabled(): bool;
}
