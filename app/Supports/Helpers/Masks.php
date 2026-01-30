<?php

use App\Managers\Shop\Models\Store;
use App\Models\Order;
use App\Models\User;
use App\Modules\ACL\Models\Role;
use App\Supports\CEP;
use App\Supports\Enums\Inventories\InventoryUnit;
use App\Supports\Helpers\DateHelper;
use Brick\Math\BigDecimal;
use Brick\Math\RoundingMode;
use Carbon\Carbon;
use Illuminate\Support\Str;
use Cknow\Money\Money;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Number;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Lang;

if (! function_exists('mask_cpf')) {
    /**
     * Formata CPF normalmente ou oculta com *.
     *
     * Ex:
     *  mask_cpf('46562227801')            -> 465.622.278-01
     *  mask_cpf('46562227801', true)      -> 465*******-**
     */
    function mask_cpf(?string $cpf, bool $hide = false)
    {
        if (! $cpf) {
            return null;
        }

        $numbers = preg_replace('/\D+/', '', $cpf);

        if (strlen($numbers) !== 11) {
            return $cpf;
        }

        if (! $hide) {
            // formato normal
            return substr($numbers, 0, 3) . '.' .
                substr($numbers, 3, 3) . '.' .
                substr($numbers, 6, 3) . '-' .
                substr($numbers, 9, 2);
        }

        // formato oculto
        return substr($numbers, 0, 3) . '*******-**';
    }
}

if (! function_exists('mask_phone')) {
    /**
     * Formata telefone normalmente ou oculta com *.
     *
     * Ex:
     *  mask_phone('11987654321')           -> (11) 98765-4321
     *  mask_phone('11987654321', true)     -> (11) 9****-**21
     */
    function mask_phone(?string $phone, bool $hide = false)
    {
        if (! $phone) {
            return null;
        }

        $numbers = preg_replace('/\D+/', '', $phone);

        if (strlen($numbers) < 10) {
            return $phone;
        }

        $ddd  = substr($numbers, 0, 2);
        $main = substr($numbers, 2);

        // celular
        if (strlen($main) === 9) {
            if (! $hide) {
                return sprintf('(%s) %s-%s', $ddd, substr($main, 0, 5), substr($main, 5));
            }

            return sprintf('(%s) %s****-**%s', $ddd, substr($main, 0, 1), substr($main, -2));
        }

        // fixo
        if (strlen($main) === 8) {
            if (! $hide) {
                return sprintf('(%s) %s-%s', $ddd, substr($main, 0, 4), substr($main, 4));
            }

            return sprintf('(%s) %s***-**%s', $ddd, substr($main, 0, 1), substr($main, -2));
        }

        return $phone;
    }
}

if (! function_exists('format_cpf_cnpj')) {
    /**
     * Aplica máscara de CPF ou CNPJ conforme o tamanho.
     *
     * Exemplos:
     *  - 12345678901      -> 123.456.789-01
     *  - 123.456.789-01   -> 123.456.789-01
     *  - 12345678000190   -> 12.345.678/0001-90
     *  - 12.345.678/0001-90 -> 12.345.678/0001-90
     */
    function format_cpf_cnpj(?string $value): string
    {
        if (! $value) {
            return '';
        }

        // Remove tudo que não for número
        $numbers = preg_replace('/\D+/', '', $value);

        // CPF (11 dígitos)
        if (strlen($numbers) === 11) {
            return substr($numbers, 0, 3) . '.' .
                substr($numbers, 3, 3) . '.' .
                substr($numbers, 6, 3) . '-' .
                substr($numbers, 9, 2);
        }

        // CNPJ (14 dígitos)
        if (strlen($numbers) === 14) {
            return substr($numbers, 0, 2) . '.' .
                substr($numbers, 2, 3) . '.' .
                substr($numbers, 5, 3) . '/' .
                substr($numbers, 8, 4) . '-' .
                substr($numbers, 12, 2);
        }

        // Se não bater com CPF nem CNPJ, retorna como veio
        return $value;
    }
}


if (! function_exists('format_phone')) {
    /**
     * Formata um telefone brasileiro.
     *
     * Exemplos:
     *  - 11987654321 -> (11) 98765-4321
     *  - 1132654321  -> (11) 3265-4321
     *  - (11)98765-4321 -> (11) 98765-4321
     */
    function format_phone(?string $phone): string
    {
        if (! $phone) {
            return '';
        }

        // Remove tudo que não for número
        $numbers = preg_replace('/\D+/', '', $phone);

        // Precisa ter pelo menos DDD + número
        if (strlen($numbers) < 10) {
            return $phone; // retorna como veio se não tiver tamanho mínimo
        }

        $ddd = substr($numbers, 0, 2);
        $rest = substr($numbers, 2);

        // Celular (9 dígitos)
        if (strlen($rest) === 9) {
            return sprintf('(%s) %s-%s', $ddd, substr($rest, 0, 5), substr($rest, 5));
        }

        // Fixo (8 dígitos)
        if (strlen($rest) === 8) {
            return sprintf('(%s) %s-%s', $ddd, substr($rest, 0, 4), substr($rest, 4));
        }

        // Fallback
        return $phone;
    }
}
