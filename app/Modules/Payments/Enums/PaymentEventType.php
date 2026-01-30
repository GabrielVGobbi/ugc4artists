<?php

declare(strict_types=1);

namespace App\Modules\Payments\Enums;

enum PaymentEventType: string
{
    case PAYMENT_CREATED = 'payment.created';
    case PAYMENT_PENDING = 'payment.pending';
    case PAYMENT_CONFIRMED = 'payment.confirmed';
    case PAYMENT_RECEIVED = 'payment.received';
    case PAYMENT_PAID = 'payment.paid';
    case PAYMENT_FAILED = 'payment.failed';
    case PAYMENT_CANCELED = 'payment.canceled';
    case PAYMENT_REFUNDED = 'payment.refunded';
    case PAYMENT_PARTIALLY_REFUNDED = 'payment.partially_refunded';
    case PAYMENT_CHARGEBACK = 'payment.chargeback';
    case PAYMENT_EXPIRED = 'payment.expired';
    case UNKNOWN = 'unknown';

    public function isSuccessful(): bool
    {
        return in_array($this, [
            self::PAYMENT_CONFIRMED,
            self::PAYMENT_RECEIVED,
            self::PAYMENT_PAID,
        ], true);
    }

    public function isFailed(): bool
    {
        return in_array($this, [
            self::PAYMENT_FAILED,
            self::PAYMENT_CANCELED,
            self::PAYMENT_EXPIRED,
        ], true);
    }

    public function isRefund(): bool
    {
        return in_array($this, [
            self::PAYMENT_REFUNDED,
            self::PAYMENT_PARTIALLY_REFUNDED,
            self::PAYMENT_CHARGEBACK,
        ], true);
    }

    public function toPaymentStatus(): ?PaymentStatus
    {
        return match ($this) {
            self::PAYMENT_CREATED => PaymentStatus::DRAFT,
            self::PAYMENT_PENDING => PaymentStatus::PENDING,
            self::PAYMENT_CONFIRMED,
            self::PAYMENT_RECEIVED,
            self::PAYMENT_PAID => PaymentStatus::PAID,
            self::PAYMENT_FAILED,
            self::PAYMENT_EXPIRED => PaymentStatus::FAILED,
            self::PAYMENT_CANCELED => PaymentStatus::CANCELED,
            self::PAYMENT_REFUNDED,
            self::PAYMENT_PARTIALLY_REFUNDED,
            self::PAYMENT_CHARGEBACK => PaymentStatus::REFUNDED,
            default => null,
        };
    }

    public static function fromProviderEvent(string $provider, string $eventType): self
    {
        $eventType = strtolower($eventType);

        return match ($provider) {
            'asaas' => self::fromAsaasEvent($eventType),
            'iugu' => self::fromIuguEvent($eventType),
            default => self::fromGenericEvent($eventType),
        };
    }

    private static function fromAsaasEvent(string $eventType): self
    {
        return match (true) {
            str_contains($eventType, 'payment_created') => self::PAYMENT_CREATED,
            str_contains($eventType, 'payment_confirmed') => self::PAYMENT_CONFIRMED,
            str_contains($eventType, 'payment_received') => self::PAYMENT_RECEIVED,
            str_contains($eventType, 'payment_overdue'),
            str_contains($eventType, 'payment_deleted') => self::PAYMENT_CANCELED,
            str_contains($eventType, 'payment_refunded') => self::PAYMENT_REFUNDED,
            str_contains($eventType, 'payment_chargeback') => self::PAYMENT_CHARGEBACK,
            default => self::fromGenericEvent($eventType),
        };
    }

    private static function fromIuguEvent(string $eventType): self
    {
        return match (true) {
            str_contains($eventType, 'invoice.created') => self::PAYMENT_CREATED,
            str_contains($eventType, 'invoice.status_changed'),
            str_contains($eventType, 'invoice.paid') => self::PAYMENT_PAID,
            str_contains($eventType, 'invoice.canceled') => self::PAYMENT_CANCELED,
            str_contains($eventType, 'invoice.expired') => self::PAYMENT_EXPIRED,
            str_contains($eventType, 'invoice.refund') => self::PAYMENT_REFUNDED,
            default => self::fromGenericEvent($eventType),
        };
    }

    private static function fromGenericEvent(string $eventType): self
    {
        return match (true) {
            str_contains($eventType, 'created') => self::PAYMENT_CREATED,
            str_contains($eventType, 'pending') => self::PAYMENT_PENDING,
            str_contains($eventType, 'confirmed'),
            str_contains($eventType, 'succeeded'),
            str_contains($eventType, 'paid'),
            str_contains($eventType, 'received') => self::PAYMENT_PAID,
            str_contains($eventType, 'failed') => self::PAYMENT_FAILED,
            str_contains($eventType, 'canceled'),
            str_contains($eventType, 'cancelled') => self::PAYMENT_CANCELED,
            str_contains($eventType, 'expired') => self::PAYMENT_EXPIRED,
            str_contains($eventType, 'refund') => self::PAYMENT_REFUNDED,
            str_contains($eventType, 'chargeback') => self::PAYMENT_CHARGEBACK,
            default => self::UNKNOWN,
        };
    }
}
