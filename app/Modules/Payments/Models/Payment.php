<?php

namespace App\Modules\Payments\Models;

use App\Casts\IntegerToMoneyCast;
use App\Models\User;
use App\Modules\Payments\Enums\PaymentMethod;
use App\Modules\Payments\Enums\PaymentStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Payment extends Model
{
    use SoftDeletes;

    protected $table = 'payments';

    protected $fillable = [
        'uuid',
        'user_id',
        'billable_type',
        'billable_id',
        'currency',
        'amount_cents',
        'wallet_applied_cents',
        'gateway_amount_cents',
        'status',
        'url',
        'gateway',
        'gateway_reference',
        'gateway_data',
        'gateway_meta',
        'gateway_payload',
        'gateway_response',
        'idempotency_key',
        'hold_transaction_id',
        'meta',
        'payment_method',

        //dates
        'due_date',
        'paid_at',
        'received_at',
        'refund_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'amount_cents' => 'int',
            'wallet_applied_cents' => 'int',
            'gateway_amount_cents' => 'int',
            'meta' => 'array',
            'gateway_data' => 'array',
            'gateway_meta' => 'array',
            'gateway_payload' => 'array',
            'gateway_response' => 'array',
            'status' => PaymentStatus::class,
            'payment_method' => PaymentMethod::class,

            //dates
            'due_date' => 'date',
            'paid_at' => 'date',
            'received_at' => 'date',
            'refund_at' => 'date',
        ];
    }

    protected $casts = [
        'amount_cents' => 'int',
        'wallet_applied_cents' => 'int',
        'gateway_amount_cents' => 'int',
        'meta' => 'array',
        'status' => PaymentStatus::class,
    ];

    public function billable(): MorphTo
    {
        return $this->morphTo();
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get PIX QR code image (base64) from meta.gateway
     */
    public function getPixImageAttribute(): ?string
    {
        return $this->meta['gateway']['qr_code_image'] ?? null;
    }

    /**
     * Get PIX payload (copia e cola) from meta.gateway
     */
    public function getPixPayloadAttribute(): ?string
    {
        return $this->meta['gateway']['qr_code_payload'] ?? null;
    }

    /**
     * Get PIX expiration date from meta.gateway.raw.pix
     */
    public function getPixExpiresAtAttribute(): ?string
    {
        return $this->gateway_response['pix']['expirationDate']
            ?? $this->meta['gateway']['raw']['pix']['expirationDate']
            ?? null;
    }

    /**
     * Get the request payload sent to the gateway.
     */
    public function getRequestHistoryAttribute(): array
    {
        return $this->gateway_payload ?? [];
    }

    /**
     * Get the response received from the gateway.
     */
    public function getResponseHistoryAttribute(): array
    {
        return $this->gateway_response ?? [];
    }

    /**
     * Check if payment has gateway history.
     */
    public function hasGatewayHistory(): bool
    {
        return ! empty($this->gateway_payload) || ! empty($this->gateway_response);
    }

    /**
     * Get full gateway interaction history.
     */
    public function getGatewayHistoryAttribute(): array
    {
        return [
            'request' => $this->gateway_payload,
            'response' => $this->gateway_response,
            'gateway' => $this->gateway,
            'reference' => $this->gateway_reference,
        ];
    }
}
