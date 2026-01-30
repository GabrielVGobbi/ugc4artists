<?php

declare(strict_types=1);

namespace App\Modules\Payments\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Webhook event model for tracking and idempotency.
 *
 * @property int $id
 * @property string $provider
 * @property string $provider_event_id
 * @property string|null $payment_uuid
 * @property string $event_type
 * @property array $payload
 * @property array|null $headers
 * @property \Carbon\Carbon|null $processed_at
 * @property string|null $error_message
 * @property int $attempts
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class WebhookEvent extends Model
{
    protected $table = 'webhook_events';

    protected $fillable = [
        'provider',
        'provider_event_id',
        'payment_uuid',
        'event_type',
        'payload',
        'headers',
        'processed_at',
        'error_message',
        'attempts',
    ];

    protected $casts = [
        'payload' => 'array',
        'headers' => 'array',
        'processed_at' => 'datetime',
        'attempts' => 'integer',
    ];

    protected $attributes = [
        'attempts' => 0,
    ];

    /**
     * Get the related payment if exists.
     */
    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class, 'payment_uuid', 'uuid');
    }

    /**
     * Check if the event has been processed.
     */
    public function isProcessed(): bool
    {
        return $this->processed_at !== null;
    }

    /**
     * Check if the event has errors.
     */
    public function hasError(): bool
    {
        return $this->error_message !== null;
    }

    /**
     * Scope for unprocessed events.
     */
    public function scopeUnprocessed($query)
    {
        return $query->whereNull('processed_at');
    }

    /**
     * Scope for events with errors.
     */
    public function scopeWithErrors($query)
    {
        return $query->whereNotNull('error_message');
    }

    /**
     * Scope for events by provider.
     */
    public function scopeByProvider($query, string $provider)
    {
        return $query->where('provider', strtolower($provider));
    }
}
