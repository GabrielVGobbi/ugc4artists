<?php

declare(strict_types=1);

namespace App\Models;

use App\Modules\Payments\Models\Payment;
use App\Supports\Traits\GenerateUuidTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

/**
 * Campaign Transaction Model
 *
 * Logs all campaign payment operations (wallet-only, gateway-only, or mixed).
 * Separate from WalletTransaction (which handles only wallet fund additions/withdrawals).
 */
class CampaignTransaction extends Model
{
    use HasFactory;
    use GenerateUuidTrait;

    protected $fillable = [
        'user_id',
        'campaign_id',
        'payment_id',
        'type',
        'status',
        'campaign_cost',
        'publication_fee',
        'total_amount',
        'wallet_amount',
        'gateway_amount',
        'payment_method',
        'gateway',
        'meta',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'campaign_cost' => 'decimal:2',
            'publication_fee' => 'decimal:2',
            'total_amount' => 'decimal:2',
            'wallet_amount' => 'decimal:2',
            'gateway_amount' => 'decimal:2',
            'meta' => 'array',
            'completed_at' => 'datetime',
        ];
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // Relationships
    // ─────────────────────────────────────────────────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(Campaign::class);
    }

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class, 'payment_id', 'uuid');
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // Scopes
    // ─────────────────────────────────────────────────────────────────────────────

    public function scopeByUser(Builder $query, ?int $userId = null): Builder
    {
        return $query->where('user_id', $userId ?? auth()->id());
    }

    public function scopeCompleted(Builder $query): Builder
    {
        return $query->where('status', 'completed');
    }

    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', 'pending');
    }

    public function scopeByType(Builder $query, string $type): Builder
    {
        return $query->where('type', $type);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // Accessors
    // ─────────────────────────────────────────────────────────────────────────────

    /**
     * Get formatted total amount for display.
     */
    public function getFormattedTotalAttribute(): string
    {
        return 'R$ ' . number_format((float) $this->total_amount, 2, ',', '.');
    }

    /**
     * Get formatted wallet amount for display.
     */
    public function getFormattedWalletAmountAttribute(): string
    {
        return 'R$ ' . number_format((float) $this->wallet_amount, 2, ',', '.');
    }

    /**
     * Get formatted gateway amount for display.
     */
    public function getFormattedGatewayAmountAttribute(): string
    {
        return 'R$ ' . number_format((float) $this->gateway_amount, 2, ',', '.');
    }

    /**
     * Get human-readable type label.
     */
    public function getTypeLabelAttribute(): string
    {
        return match ($this->type) {
            'wallet_only' => 'Carteira',
            'gateway_only' => ucfirst($this->payment_method ?? 'Gateway'),
            'mixed' => 'Misto (Carteira + ' . ucfirst($this->payment_method ?? 'Gateway') . ')',
            default => 'Desconhecido',
        };
    }

    /**
     * Get status badge color.
     */
    public function getStatusColorAttribute(): string
    {
        return match ($this->status) {
            'completed' => 'success',
            'pending' => 'warning',
            'failed' => 'danger',
            default => 'secondary',
        };
    }

    /**
     * Get status label.
     */
    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'completed' => 'Concluído',
            'pending' => 'Pendente',
            'failed' => 'Falhou',
            default => 'Desconhecido',
        };
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // Helper Methods
    // ─────────────────────────────────────────────────────────────────────────────

    /**
     * Check if transaction is completed.
     */
    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    /**
     * Check if transaction is pending.
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if transaction failed.
     */
    public function isFailed(): bool
    {
        return $this->status === 'failed';
    }

    /**
     * Mark transaction as completed.
     */
    public function markCompleted(): bool
    {
        return $this->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);
    }

    /**
     * Mark transaction as failed.
     */
    public function markFailed(): bool
    {
        return $this->update([
            'status' => 'failed',
        ]);
    }
}
