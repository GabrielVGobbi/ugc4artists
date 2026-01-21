<?php

namespace App\Supports\Contracts;

interface Enum
{
    /**
     * Retorna o texto legível do status
     */
    public static function getLabelTextByLabel(string $label);

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
}
