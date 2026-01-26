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

if (!function_exists('uuid')) {
    /**
     * Generate a UUID (version 4).
     *
     * @return \Ramsey\Uuid\UuidInterface
     */
    function uuid()
    {
        return Str::uuid();
    }
}

/**
 * Convert the given number to its currency equivalent.
 *
 * @param  int|float  $number
 * @param  string  $in
 * @param  string|null  $locale
 * @return string|false
 */
function toCurrency($value, $in = "BRL", $locale = 'pt-BR')
{
    if (empty($value)) {
        return 0;
    }

    return Number::currency(($value), $in, $locale);
}

function toCents($amount)
{
    return BigDecimal::of((string) $amount)
        ->withPointMovedRight(2)
        ->toScale(0, RoundingMode::HALF_UP)
        ->toInt();
}

function amountToDec($valor)
{
    if (empty($valor)) {
        return 0;
    }

    $money = preg_replace('/[\x{00A0}\x{202F}\s]/u', '', $valor); // remove espaços invisíveis
    $money = str_replace(['R$', '%'], '', $money);

    if (strpos($money, ',') !== false && strpos($money, '.') !== false) {
        if (strrpos($money, ',') > strrpos($money, '.')) {
            $money = str_replace('.', '', $money); // remove milhar
            $money = str_replace(',', '.', $money); // decimal vira ponto
        } else {
            $money = str_replace(',', '', $money); // remove milhar
        }
    } elseif (strpos($money, ',') !== false) {
        $money = str_replace('.', '', $money); // só por segurança
        $money = str_replace(',', '.', $money);
    } else {
        $money = str_replace(',', '', $money);
    }

    if (!is_numeric($money)) {
        throw ValidationException::withMessages(['Valor Numérico Informado é Inválido : ' . $money]);
    }

    return floatval($money);
}
