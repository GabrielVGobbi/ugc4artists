<?php

namespace App\Supports\Contracts;

interface StatusableEnum
{
    /**
     * Retorna o valor do status
     */
    public function getValue(): string;

    /**
     * Retorna o texto legível do status
     */
    public function getLabelText(): string;

    /**
     * Retorna a cor do status para UI
     */
    public function getLabelColor(): string;

    /**
     * Retorna o ícone do status
     */
    public function getIcon(): string;

    /**
     * Retorna o texto da ação para mudança de status
     */
    public function getLabelTextDefinitionStatus(): string;

    /**
     * Verifica se pode transicionar para outro status
     */
    public function canTransitionTo(self $newStatus): bool;

    /**
     * Retorna os status disponíveis para transição
     */
    public function getAvailableTransitions(): array;

    /**
     * Retorna os campos que devem ser atualizados quando o status muda
     */
    public function getStatusFields(): array;

    /**
     * Retorna metadados adicionais para o log
     */
    public function getLogMetadata(): array;

    /**
     * Define se a mudança de status requer motivo obrigatório
     */
    public function requiresReason(): bool;

    /**
     * Define se a mudança de status requer confirmação adicional
     */
    public function requiresConfirmation(): bool;
}
