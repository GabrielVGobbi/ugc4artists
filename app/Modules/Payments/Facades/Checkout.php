<?php

declare(strict_types=1);

namespace App\Modules\Payments\Facades;

use App\Models\User;
use App\Modules\Payments\Checkout\CheckoutBuilder;
use Illuminate\Support\Facades\Facade;

/**
 * Facade for fluent checkout builder.
 *
 * Usage:
 * ```php
 * $payment = Checkout::for($user)
 *     ->billable($campaign)
 *     ->amount(10000)
 *     ->method(PaymentMethod::PIX)
 *     ->gateway('asaas')
 *     ->useWallet(true)
 *     ->create();
 * ```
 *
 * @method static CheckoutBuilder for(User $user)
 *
 * @see CheckoutBuilder
 */
class Checkout extends Facade
{
    /**
     * Get the registered name of the component.
     */
    protected static function getFacadeAccessor(): string
    {
        return CheckoutBuilder::class;
    }
}
