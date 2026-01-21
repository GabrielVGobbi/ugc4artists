<?php

namespace App\Supports\Enums\Users;

use App\Supports\Contracts\Enum;
use App\Supports\Enums\Concerns\GetsAttributes;

enum UserRoleType: string implements Enum
{
    use GetsAttributes;

    case ARTIST = 'artist';
    case BRAND = 'brand';
    case CREATOR = 'creator';

    public static function getLabelTextByLabel(string $label): string
    {
        return match ($label) {
            'artist' => 'Artista',
            'brand' => 'Marca',
            'creator' => 'Criador',
            default => 'Desconhecido',
        };
    }

    public function getLabelText(): string
    {
        return match ($this) {
            self::ARTIST => 'Artista',
            self::BRAND => 'Marca',
            self::CREATOR => 'Criador',
        };
    }

    public function getLabelColor(): string
    {
        return match ($this) {
            self::ARTIST => 'primary',
            self::BRAND => 'info',
            self::CREATOR => 'success',
        };
    }

    public function getIcon(): string
    {
        return match ($this) {
            self::ARTIST => 'Palette',
            self::BRAND => 'Briefcase',
            self::CREATOR => 'UserRound',
        };
    }
}
