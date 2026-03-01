<?php

declare(strict_types=1);

namespace App\Models;

use App\Modules\Payments\Models\Payment;
use App\Supports\Traits\GenerateUuidTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Builder;

/**
 * Account Statement Model - Extrato Bancário Unificado
 *
 * Registra TODAS as movimentações financeiras da conta do usuário:
 * - Depósitos na carteira
 * - Pagamentos de serviços (campaigns, subscriptions, orders, etc)
 * - Reembolsos
 * - Saques
 */
class AccountStatement extends Model
{
    use HasFactory;
    use GenerateUuidTrait;

    protected $fillable = [
        'user_id',
        'statementable_type',
        'statementable_id',
        'type',
        'category',
        'amount',
        'wallet_amount',
        'gateway_amount',
        'payment_method',
        'gateway',
        'payment_id',
        'status',
        'description',
        'meta',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
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

    /**
     * Polymorphic relationship - serviço relacionado (Campaign, Subscription, Order, etc)
     */
    public function statementable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Payment relacionado (se houver)
     */
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

    public function scopeByCategory(Builder $query, string $category): Builder
    {
        return $query->where('category', $category);
    }

    public function scopeByPaymentMethod(Builder $query, string $method): Builder
    {
        return $query->where('payment_method', $method);
    }

    public function scopeDateRange(Builder $query, ?string $from, ?string $to): Builder
    {
        if ($from) {
            $query->whereDate('created_at', '>=', $from);
        }

        if ($to) {
            $query->whereDate('created_at', '<=', $to);
        }

        return $query;
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // Accessors
    // ─────────────────────────────────────────────────────────────────────────────

    /**
     * Formatted amount with sign (+ or -)
     */
    public function getFormattedAmountAttribute(): string
    {
        $sign = $this->amount >= 0 ? '+ ' : '- ';
        $absAmount = abs((float) $this->amount);
        return $sign . 'R$ ' . number_format($absAmount, 2, ',', '.');
    }

    /**
     * Get type label in Portuguese
     */
    public function getTypeLabelAttribute(): string
    {
        return match ($this->type) {
            'deposit' => 'Depósito',
            'service_payment' => 'Pagamento',
            'refund' => 'Reembolso',
            'withdrawal' => 'Saque',
            default => 'Desconhecido',
        };
    }

    /**
     * Get category label
     */
    public function getCategoryLabelAttribute(): string
    {
        return match ($this->category) {
            'wallet_deposit' => 'Depósito na Carteira',
            'campaign_payment' => 'Pagamento de Campanha',
            'subscription_fee' => 'Mensalidade',
            'ad_spend' => 'Tráfego Pago',
            'marketplace_order' => 'Compra no Marketplace',
            'campaign_refund' => 'Reembolso de Campanha',
            'wallet_withdrawal' => 'Saque da Carteira',
            default => ucfirst(str_replace('_', ' ', $this->category)),
        };
    }

    /**
     * Get status color for UI
     */
    public function getStatusColorAttribute(): string
    {
        return match ($this->status) {
            'completed' => 'success',
            'pending' => 'warning',
            'failed' => 'danger',
            'refunded' => 'info',
            default => 'secondary',
        };
    }

    /**
     * Get status label
     */
    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'completed' => 'Concluído',
            'pending' => 'Pendente',
            'failed' => 'Falhou',
            'refunded' => 'Reembolsado',
            default => 'Desconhecido',
        };
    }

    /**
     * Check if amount is positive (money in)
     */
    public function isIncome(): bool
    {
        return $this->amount > 0;
    }

    /**
     * Check if amount is negative (money out)
     */
    public function isExpense(): bool
    {
        return $this->amount < 0;
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // Helper Methods
    // ─────────────────────────────────────────────────────────────────────────────

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isFailed(): bool
    {
        return $this->status === 'failed';
    }

    public function markCompleted(): bool
    {
        return $this->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);
    }

    public function markFailed(): bool
    {
        return $this->update([
            'status' => 'failed',
        ]);
    }
}
