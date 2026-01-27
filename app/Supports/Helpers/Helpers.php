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

if (!function_exists('only_numbers')) {
    /**
     * Extrai apenas os números de uma string.
     *
     * @param string $string
     * @return string
     */
    function only_numbers($string)
    {
        if (empty($string)) {
            return 0;
        }

        return preg_replace('/\D/', '', $string);
    }
}

function validarCpfCnpj($value)
{
    // Remove caracteres não numéricos
    $value = preg_replace('/[^0-9]/', '', $value);

    // Valida o tamanho do CPF ou CNPJ
    if (strlen($value) === 11) {
        return validarCpf($value);
    } elseif (strlen($value) === 14) {
        return validarCnpj($value);
    }

    return false;
}

function validarCpf($cpf)
{
    if (app()->isLocal()) {
        return true;
    }

    // Rejeita números repetidos, como "111.111.111-11"
    if (preg_match('/(\d)\1{10}/', $cpf)) {
        return false;
    }

    // Calcula os dígitos verificadores
    for ($t = 9; $t < 11; $t++) {
        $d = 0;
        for ($c = 0; $c < $t; $c++) {
            $d += $cpf[$c] * (($t + 1) - $c);
        }
        $d = ((10 * $d) % 11) % 10;
        if ($cpf[$c] != $d) {
            return false;
        }
    }

    return true;
}

function validarCnpj($cnpj)
{
    // Rejeita números repetidos, como "11.111.111/1111-11"
    if (preg_match('/(\d)\1{13}/', $cnpj)) {
        return false;
    }

    // Pesos para o cálculo do primeiro e segundo dígito verificador
    $pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    $pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

    // Calcula o primeiro dígito verificador
    $d1 = 0;
    for ($i = 0; $i < 12; $i++) {
        $d1 += $cnpj[$i] * $pesos1[$i];
    }
    $d1 = ($d1 % 11 < 2) ? 0 : 11 - ($d1 % 11);

    // Calcula o segundo dígito verificador
    $d2 = 0;
    for ($i = 0; $i < 13; $i++) {
        $d2 += $cnpj[$i] * $pesos2[$i];
    }
    $d2 = ($d2 % 11 < 2) ? 0 : 11 - ($d2 % 11);

    // Verifica os dígitos
    return $cnpj[12] == $d1 && $cnpj[13] == $d2;
}
