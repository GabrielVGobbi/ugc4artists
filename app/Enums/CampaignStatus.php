<?php

declare(strict_types=1);

namespace App\Enums;

use App\Supports\Contracts\StatusableEnum;
use App\Supports\Enums\Concerns\GetsAttributes;

enum CampaignStatus: string implements StatusableEnum
{
    use GetsAttributes;

    case DRAFT = 'draft';
    case UNDER_REVIEW = 'under_review';
    case AWAITING_PAYMENT = 'awaiting_payment';
    case SENT_TO_CREATORS = 'sent_to_creators';
    case IN_PROGRESS = 'in_progress';
    case COMPLETED = 'completed';
    case CANCELLED = 'cancelled';

    public function getValue(): string
    {
        return $this->value;
    }

    public static function getLabelTextByLabel(string $label): string
    {
        return match ($label) {
            'draft' => 'Rascunho',
            'under_review' => 'Em Análise',
            'awaiting_payment' => 'Aguardando Pagamento',
            'sent_to_creators' => 'Enviado para Creators',
            'in_progress' => 'Em Andamento',
            'completed' => 'Finalizada',
            'cancelled' => 'Cancelada',
            default => 'Desconhecido',
        };
    }

    public function getLabelText(): string
    {
        return match ($this) {
            self::DRAFT => 'Rascunho',
            self::UNDER_REVIEW => 'Em Análise',
            self::AWAITING_PAYMENT => 'Aguardando Pagamento',
            self::SENT_TO_CREATORS => 'Enviado para Creators',
            self::IN_PROGRESS => 'Em Andamento',
            self::COMPLETED => 'Finalizada',
            self::CANCELLED => 'Cancelada',
        };
    }

    public function getLabelColor(): string
    {
        return match ($this) {
            self::DRAFT => 'gray',
            self::UNDER_REVIEW => 'warning',
            self::AWAITING_PAYMENT => 'warning',
            self::SENT_TO_CREATORS => 'info',
            self::IN_PROGRESS => 'success',
            self::COMPLETED => 'success',
            self::CANCELLED => 'danger',
        };
    }

    public function getIcon(): string
    {
        return match ($this) {
            self::DRAFT => 'pencil',
            self::UNDER_REVIEW => 'search',
            self::AWAITING_PAYMENT => 'clock',
            self::SENT_TO_CREATORS => 'paper-airplane',
            self::IN_PROGRESS => 'play-circle',
            self::COMPLETED => 'check-circle',
            self::CANCELLED => 'x-circle',
        };
    }

    public function getLabelTextDefinitionStatus(): string
    {
        return match ($this) {
            self::DRAFT => 'Mover para Rascunho',
            self::UNDER_REVIEW => 'Enviar para Análise',
            self::AWAITING_PAYMENT => 'Aguardar Pagamento',
            self::SENT_TO_CREATORS => 'Enviar para Creators',
            self::IN_PROGRESS => 'Iniciar Campanha',
            self::COMPLETED => 'Finalizar Campanha',
            self::CANCELLED => 'Cancelar Campanha',
        };
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // Transitions
    // ─────────────────────────────────────────────────────────────────────────────

    public function canTransitionTo(StatusableEnum $newStatus): bool
    {
        if (!$newStatus instanceof self) {
            return false;
        }

        return in_array($newStatus, $this->getAvailableTransitions(), true);
    }

    /**
     * @return self[]
     */
    public function getAvailableTransitions(): array
    {
        return match ($this) {
            self::DRAFT => [
                self::AWAITING_PAYMENT,
                self::CANCELLED,
            ],
            self::AWAITING_PAYMENT => [
                self::UNDER_REVIEW,
                self::DRAFT,
                self::CANCELLED,
            ],
            self::UNDER_REVIEW => [
                self::SENT_TO_CREATORS,
                self::DRAFT,
                self::CANCELLED,
            ],
            self::SENT_TO_CREATORS => [
                self::IN_PROGRESS,
                self::CANCELLED,
            ],
            self::IN_PROGRESS => [
                self::COMPLETED,
                self::CANCELLED,
            ],
            self::COMPLETED => [],
            self::CANCELLED => [
                self::DRAFT,
            ],
        };
    }

    public function getStatusFields(): array
    {
        return match ($this) {
            self::DRAFT => [],
            self::UNDER_REVIEW => ['reviewed_at'],
            self::AWAITING_PAYMENT => ['submitted_at'],
            self::SENT_TO_CREATORS => ['publication_paid_at'],
            self::IN_PROGRESS => ['started_at'],
            self::COMPLETED => ['completed_at'],
            self::CANCELLED => ['cancelled_at'],
        };
    }

    public function getLogMetadata(): array
    {
        return [
            'status' => $this->value,
            'label' => $this->getLabelText(),
        ];
    }

    public function requiresReason(): bool
    {
        return match ($this) {
            self::CANCELLED, self::DRAFT => true,
            default => false,
        };
    }

    public function requiresConfirmation(): bool
    {
        return match ($this) {
            self::CANCELLED, self::COMPLETED => true,
            default => false,
        };
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────────

    public function isDraft(): bool
    {
        return $this === self::DRAFT;
    }

    public function isUnderReview(): bool
    {
        return $this === self::UNDER_REVIEW;
    }

    public function isAwaitingPayment(): bool
    {
        return $this === self::AWAITING_PAYMENT;
    }

    public function isSentToCreators(): bool
    {
        return $this === self::SENT_TO_CREATORS;
    }

    public function isInProgress(): bool
    {
        return $this === self::IN_PROGRESS;
    }

    public function isCompleted(): bool
    {
        return $this === self::COMPLETED;
    }

    public function isCancelled(): bool
    {
        return $this === self::CANCELLED;
    }

    public function isFinal(): bool
    {
        return $this === self::COMPLETED;
    }

    public function isActive(): bool
    {
        return in_array($this, [
            self::SENT_TO_CREATORS,
            self::IN_PROGRESS,
        ], true);
    }

    public function canBeEdited(): bool
    {
        return in_array($this, [self::DRAFT, self::UNDER_REVIEW], true);
    }

    public function canBePaid(): bool
    {
        return in_array($this, [
            self::AWAITING_PAYMENT,
        ], true);
    }

    public function transitionTo(self $newStatus): self
    {
        if (!$this->canTransitionTo($newStatus)) {
            throw new \InvalidArgumentException(
                "Transição inválida: {$this->getLabelText()} → {$newStatus->getLabelText()}"
            );
        }

        return $newStatus;
    }
}
