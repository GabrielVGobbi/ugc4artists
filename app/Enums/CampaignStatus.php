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
    case APPROVED = 'approved';
    case REFUSED = 'refused';
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
            'under_review' => 'Em analise',
            'approved' => 'Aprovada',
            'refused' => 'Recusada',
            'awaiting_payment' => 'Aguardando pagamento',
            'sent_to_creators' => 'Enviado para creators',
            'in_progress' => 'Em andamento',
            'completed' => 'Finalizada',
            'cancelled' => 'Cancelada',
            default => 'Desconhecido',
        };
    }

    public function getLabelText(): string
    {
        return self::getLabelTextByLabel($this->value);
    }

    public function getLabelColor(): string
    {
        return match ($this) {
            self::DRAFT => 'gray',
            self::UNDER_REVIEW, self::AWAITING_PAYMENT => 'warning',
            self::APPROVED, self::SENT_TO_CREATORS => 'info',
            self::IN_PROGRESS, self::COMPLETED => 'success',
            self::REFUSED, self::CANCELLED => 'danger',
        };
    }

    public function getIcon(): string
    {
        return match ($this) {
            self::DRAFT => 'pencil',
            self::UNDER_REVIEW => 'search',
            self::APPROVED => 'check',
            self::REFUSED => 'x-circle',
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
            self::DRAFT => 'Mover para rascunho',
            self::UNDER_REVIEW => 'Enviar para analise',
            self::APPROVED => 'Aprovar campanha',
            self::REFUSED => 'Recusar campanha',
            self::AWAITING_PAYMENT => 'Aguardar pagamento',
            self::SENT_TO_CREATORS => 'Enviar para creators',
            self::IN_PROGRESS => 'Iniciar campanha',
            self::COMPLETED => 'Finalizar campanha',
            self::CANCELLED => 'Cancelar campanha',
        };
    }

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
            self::DRAFT => [self::AWAITING_PAYMENT, self::CANCELLED],
            self::AWAITING_PAYMENT => [self::UNDER_REVIEW, self::DRAFT, self::CANCELLED],
            self::UNDER_REVIEW => [self::APPROVED, self::REFUSED, self::DRAFT, self::CANCELLED],
            self::APPROVED => [self::SENT_TO_CREATORS, self::IN_PROGRESS, self::CANCELLED],
            self::REFUSED => [self::DRAFT],
            self::SENT_TO_CREATORS => [self::IN_PROGRESS, self::CANCELLED],
            self::IN_PROGRESS => [self::COMPLETED, self::CANCELLED],
            self::COMPLETED => [],
            self::CANCELLED => [self::DRAFT],
        };
    }

    public function getStatusFields(): array
    {
        return match ($this) {
            self::DRAFT => [],
            self::UNDER_REVIEW => ['reviewed_at'],
            self::APPROVED => ['approved_at'],
            self::REFUSED => ['rejected_at', 'rejection_reason'],
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
        return in_array($this, [self::CANCELLED, self::DRAFT, self::REFUSED], true);
    }

    public function requiresConfirmation(): bool
    {
        return in_array($this, [self::CANCELLED, self::COMPLETED], true);
    }

    public function isDraft(): bool
    {
        return $this === self::DRAFT;
    }

    public function isPending(): bool
    {
        return $this === self::UNDER_REVIEW;
    }

    public function isUnderReview(): bool
    {
        return $this === self::UNDER_REVIEW;
    }

    public function isApproved(): bool
    {
        return $this === self::APPROVED;
    }

    public function isRefused(): bool
    {
        return $this === self::REFUSED;
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
        return in_array($this, [self::APPROVED, self::SENT_TO_CREATORS, self::IN_PROGRESS], true);
    }

    public function canBeEdited(): bool
    {
        return $this === self::DRAFT;
    }

    public function canBePaid(): bool
    {
        return in_array($this, [self::AWAITING_PAYMENT], true);
    }

    public function transitionTo(self $newStatus): self
    {
        if (!$this->canTransitionTo($newStatus)) {
            throw new \InvalidArgumentException(
                "Transicao invalida: {$this->getLabelText()} -> {$newStatus->getLabelText()}"
            );
        }

        return $newStatus;
    }
}
