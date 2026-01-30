<?php

namespace App\Modules\Payments\Enums;

use App\Supports\Enums\Concerns\GetsAttributes;
use Illuminate\Support\Str;
use Illuminate\Support\Collection;

enum PaymentMethod: string
{
    use GetsAttributes;

    case PIX = 'pix';

    case BOLETO = 'boleto_bancario';

    case CREDIT_CARD = 'credit_card';

    case NUBANK = 'nuconta';

    case BEST_PLAY_BANK = 'best_play_conta';

    /**
     * Define which payment methods are active.
     */
    public function isActive(): bool
    {
        return match ($this) {
            self::PIX => true,
            self::CREDIT_CARD => true,
            self::BOLETO => false,
            self::NUBANK => false,
            self::BEST_PLAY_BANK => false,
        };
    }

    /**
     * @return Collection
     */
    public static function options(): Collection
    {
        $cases   = static::cases();
        $options = [];
        foreach ($cases as $case) {

            if ($case->isActive()) {

                $label = $case->name;
                if (Str::contains($label, '_')) {
                    $label = Str::replace('_', ' ', $label);
                }
                $options[] = [
                    #'case' => $case->name,
                    'value' => $case->name,
                    'label' => Str::title($label),
                    'label_translate' => static::getLabelTextByLabel($case->value)
                ];
            }
        }

        return collect($options);
    }

    public static function getLabelTextByLabel($label): string
    {
        return match ($label) {
            'boleto_bancario' => 'Boleto Bancário',
            'pix' => 'Pagamento via Pix',
            'credit_card' => 'Cartão de Crédito',
            'nuconta' => 'Nubank',
            'best_play_conta' => 'Best Play Bank',
        };
    }

    /**
     * Human-readable label for UI
     */
    public function getLabelText(): string
    {
        return match ($this) {
            self::BOLETO => 'Boleto Bancário',
            self::PIX => 'Pagamento via Pix',
            self::CREDIT_CARD => 'Cartão de Crédito',
            self::NUBANK => 'Nubank',
            self::BEST_PLAY_BANK => 'Best Play Bank',
        };
    }

    /**
     * Badge color class for UI (e.g. Tailwind, Bootstrap)
     */
    public function getLabelColor(): string
    {
        return match ($this) {
            self::BOLETO => 'gray',
            self::PIX => 'green',
            self::CREDIT_CARD => 'blue',
            self::NUBANK => 'purple',
            self::BEST_PLAY_BANK => 'orange',
        };
    }

    /**
     * Icon (emoji or class name for frontend)
     */
    public function getIcon(): string
    {
        return match ($this) {
            self::BOLETO => '💵',
            self::PIX => '⚡',
            self::CREDIT_CARD => '💳',
            self::NUBANK => '🏦',
            self::BEST_PLAY_BANK => '🏁',
        };
    }
}
