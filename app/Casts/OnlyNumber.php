<?php

namespace App\Casts;

use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use Illuminate\Support\Number;

class OnlyNumber implements CastsAttributes
{
    /**
     * Money constructor.
     * @param $amount
     * @param $currency
     */
    public function __construct()
    {
    }

    public function get($model, string $key, $value, array $attributes)
    {
        return $value;
    }

    public function set($model, string $key, $value, array $attributes)
    {
        return $value == 0 ? 0 : only_numbers($value);
    }
}
