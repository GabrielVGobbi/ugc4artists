<?php

namespace App\Supports\Enums\Concerns;

trait HasSelect
{
    /**
     * Retorna todas as opções do enum como array para uso em selects
     */
    public static function toSelectArray(): array
    {
        $options = [];
        
        foreach (static::cases() as $case) {
            $options[$case->value] = $case->getLabel();
        }
        
        return $options;
    }

    /**
     * Retorna todas as opções como array de objetos com value e label
     */
    public static function toSelectOptions(): array
    {
        $options = [];
        
        foreach (static::cases() as $case) {
            $options[] = [
                'value' => $case->value,
                'label' => $case->getLabel(),
            ];
        }
        
        return $options;
    }

    /**
     * Retorna apenas os valores do enum
     */
    public static function toValues(): array
    {
        return array_column(static::cases(), 'value');
    }

    /**
     * Retorna apenas os labels do enum
     */
    public static function toLabels(): array
    {
        return array_map(fn($case) => $case->getLabel(), static::cases());
    }

    /**
     * Verifica se um valor existe no enum
     */
    public static function hasValue(string $value): bool
    {
        return in_array($value, static::toValues(), true);
    }

    /**
     * Retorna o caso do enum pelo valor ou null se não encontrar
     */
    public static function tryFromValue(string $value): ?static
    {
        return static::tryFrom($value);
    }
} 