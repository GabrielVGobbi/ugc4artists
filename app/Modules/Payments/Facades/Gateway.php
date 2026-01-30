<?php

declare(strict_types=1);

namespace App\Modules\Payments\Facades;

use App\Modules\Payments\Core\Contracts\GatewayManagerInterface;
use App\Modules\Payments\GatewayRegistry;
use Illuminate\Support\Facades\Facade;

/**
 * Generic facade for accessing payment gateways dynamically.
 *
 * Usage:
 * - Gateway::driver('asaas')->customers()->create($request)
 * - Gateway::default()->payments()->createCharge($request)
 * - Gateway::getAvailableGateways()
 *
 * @method static GatewayManagerInterface driver(?string $gateway = null)
 * @method static GatewayManagerInterface default()
 * @method static array getAvailableGateways()
 * @method static array getGatewaysStatus()
 * @method static bool hasGateway(string $gateway)
 * @method static string getDefaultGateway()
 *
 * @see GatewayRegistry
 */
class Gateway extends Facade
{
    /**
     * Get the registered name of the component.
     */
    protected static function getFacadeAccessor(): string
    {
        return GatewayRegistry::class;
    }
}
