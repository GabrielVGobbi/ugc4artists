<?php

use App\Managers\Shop\Models\Store;
use App\Models\Order;
use App\Models\User;
use App\Modules\ACL\Models\Role;
use App\Supports\CEP;
use App\Supports\Enums\Inventories\InventoryUnit;
use App\Supports\Helpers\DateHelper;
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
