<?php

declare(strict_types=1);

namespace App\Modules\Payments\Facades;

use App\Modules\Payments\Core\Contracts\CustomerServiceInterface;
use App\Modules\Payments\Core\Contracts\PaymentServiceInterface;
use App\Modules\Payments\Core\Contracts\SplitServiceInterface;
use App\Modules\Payments\Core\Contracts\SubscriptionServiceInterface;
use App\Modules\Payments\Core\Contracts\TransferServiceInterface;
use App\Modules\Payments\Gateways\Asaas\AsaasManager;
use Illuminate\Support\Facades\Facade;

/**
 * Facade for accessing Asaas gateway services.
 *
 * @method static CustomerServiceInterface customers()
 * @method static PaymentServiceInterface payments()
 * @method static SubscriptionServiceInterface subscriptions()
 * @method static TransferServiceInterface transfers()
 * @method static SplitServiceInterface splits()
 * @method static string name()
 * @method static bool isAvailable()
 * @method static bool supportsFeature(string $feature)
 * @method static array getSupportedFeatures()
 * @method static array getBalance()
 * @method static array getAccountInfo()
 *
 * @see AsaasManager
 */
class Asaas extends Facade
{
    /**
     * Get the registered name of the component.
     */
    protected static function getFacadeAccessor(): string
    {
        return AsaasManager::class;
    }
}
