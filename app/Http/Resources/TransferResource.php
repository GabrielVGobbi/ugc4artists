<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransferResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Get the sender (from) and receiver (to) from the transfer transactions
        $fromUser = $this->withdraw?->wallet?->holder;
        $toUser = $this->deposit?->wallet?->holder;

        // Get the transfer amount from the withdraw transaction (absolute value)
        $amount = abs($this->withdraw?->amount ?? 0);

        // Get description from extra meta or meta
        $description = $this->extra['description'] ?? $this->meta['description'] ?? null;

        // Determine status
        $status = $this->getTransferStatus();

        return [
            'id' => $this->uuid ?? $this->id,
            'from_user' => $fromUser ? [
                'id' => $fromUser->uuid ?? $fromUser->id,
                'name' => $fromUser->name,
                'email' => $fromUser->email,
                'avatar' => $fromUser->avatar ?? null,
            ] : null,
            'to_user' => $toUser ? [
                'id' => $toUser->uuid ?? $toUser->id,
                'name' => $toUser->name,
                'email' => $toUser->email,
                'avatar' => $toUser->avatar ?? null,
            ] : null,
            'amount' => $amount,
            'amount_formatted' => toCurrency($amount / 100),
            'description' => $description,
            'status' => [
                'value' => $status,
                'label' => $this->getStatusLabel($status),
                'color' => $this->getStatusColor($status),
            ],
            'can_cancel' => $this->canBeCancelled($request),
            'cancelled_at' => $this->extra['cancelled_at'] ?? null,
            'cancelled_by' => $this->extra['cancelled_by_name'] ?? null,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }

    /**
     * Get the transfer status.
     */
    protected function getTransferStatus(): string
    {
        if ($this->deleted_at !== null || ($this->extra['cancelled_at'] ?? null)) {
            return 'cancelled';
        }

        return 'completed';
    }

    /**
     * Get the status label in Portuguese.
     */
    protected function getStatusLabel(string $status): string
    {
        return match ($status) {
            'completed' => 'Concluída',
            'cancelled' => 'Cancelada',
            'pending' => 'Pendente',
            default => 'Desconhecido',
        };
    }

    /**
     * Get the status color for UI display.
     */
    protected function getStatusColor(string $status): string
    {
        return match ($status) {
            'completed' => 'success',
            'cancelled' => 'danger',
            'pending' => 'warning',
            default => 'secondary',
        };
    }

    /**
     * Check if the transfer can be cancelled by the current user.
     */
    protected function canBeCancelled(Request $request): bool
    {
        $user = $request->user();

        if (! $user) {
            return false;
        }

        // Only the sender can cancel
        $fromWallet = $this->withdraw?->wallet;

        if (! $fromWallet || $fromWallet->holder_id !== $user->id) {
            return false;
        }

        // Cannot cancel if already cancelled
        if ($this->deleted_at !== null || ($this->extra['cancelled_at'] ?? null)) {
            return false;
        }

        return true;
    }
}
