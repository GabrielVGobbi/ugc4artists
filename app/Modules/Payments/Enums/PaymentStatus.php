<?php

declare(strict_types=1);

namespace App\Modules\Payments\Enums;

use App\Supports\Enums\Concerns\GetsAttributes;

enum PaymentStatus: string
{
    use GetsAttributes;

    case DRAFT = 'draft';
    case PENDING = 'pending';
    case REQUIRES_ACTION = 'requires_action';
    case PAID = 'paid';
    case FAILED = 'failed';
    case CANCELED = 'canceled';
    case REFUNDED = 'refunded';

    public function getLabelText(): string
    {
        return match ($this) {
            self::DRAFT => 'Rascunho',
            self::PENDING => 'Pendente',
            self::REQUIRES_ACTION => 'Ação Necessária',
            self::PAID => 'Pago',
            self::FAILED => 'Falhou',
            self::CANCELED => 'Cancelado',
            self::REFUNDED => 'Reembolsado',
        };
    }

    public function getLabelColor(): string
    {
        return match ($this) {
            self::DRAFT => 'gray',
            self::PENDING => 'yellow',
            self::REQUIRES_ACTION => 'orange',
            self::PAID => 'green',
            self::FAILED => 'red',
            self::CANCELED => 'gray',
            self::REFUNDED => 'blue',
        };
    }

    public function getIcon(): string
    {
        return match ($this) {
            self::DRAFT => 'pencil',
            self::PENDING => 'clock',
            self::REQUIRES_ACTION => 'exclamation-circle',
            self::PAID => 'check-circle',
            self::FAILED => 'x-circle',
            self::CANCELED => 'ban',
            self::REFUNDED => 'arrow-uturn-left',
        };
    }

    public function isFinal(): bool
    {
        return in_array($this, [
            self::PAID,
            self::FAILED,
            self::CANCELED,
            self::REFUNDED,
        ], true);
    }

    public function isSuccessful(): bool
    {
        return $this === self::PAID;
    }

    public function isPending(): bool
    {
        return in_array($this, [
            self::DRAFT,
            self::PENDING,
            self::REQUIRES_ACTION,
        ], true);
    }

    public function canTransitionTo(self $target): bool
    {
        return match ($this) {
            self::DRAFT => in_array($target, [self::PENDING, self::CANCELED], true),
            self::PENDING => in_array($target, [self::PAID, self::FAILED, self::CANCELED, self::REQUIRES_ACTION], true),
            self::REQUIRES_ACTION => in_array($target, [self::PAID, self::FAILED, self::CANCELED], true),
            self::PAID => $target === self::REFUNDED,
            self::FAILED, self::CANCELED, self::REFUNDED => false,
        };
    }

    /**
     * @return self[]
     */
    public function getAvailableTransitions(): array
    {
        return match ($this) {
            self::DRAFT => [self::PENDING, self::CANCELED],
            self::PENDING => [self::PAID, self::FAILED, self::CANCELED, self::REQUIRES_ACTION],
            self::REQUIRES_ACTION => [self::PAID, self::FAILED, self::CANCELED],
            self::PAID => [self::REFUNDED],
            self::FAILED, self::CANCELED, self::REFUNDED => [],
        };
    }
}
