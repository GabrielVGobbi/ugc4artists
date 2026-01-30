<?php

declare(strict_types=1);

namespace App\Modules\Payments;

use App\Modules\Payments\Core\Contracts\GatewayManagerInterface;
use App\Modules\Payments\Gateways\Asaas\AsaasManager;
use App\Modules\Payments\Gateways\Iugu\IuguManager;
use Closure;
use Illuminate\Contracts\Container\Container;
use InvalidArgumentException;

/**
 * Registry for managing multiple payment gateways.
 * Provides a unified interface for accessing any registered gateway.
 */
final class GatewayRegistry
{
    /**
     * @var array<string, class-string<GatewayManagerInterface>|Closure>
     */
    protected array $gateways = [];

    /**
     * @var array<string, GatewayManagerInterface>
     */
    protected array $resolvedGateways = [];

    public function __construct(private Container $app)
    {
        $this->registerDefaultGateways();
    }

    /**
     * Get a gateway driver by name.
     * If no name is provided, returns the default gateway.
     */
    public function driver(?string $gateway = null): GatewayManagerInterface
    {
        $gateway ??= $this->getDefaultGateway();

        if (isset($this->resolvedGateways[$gateway])) {
            return $this->resolvedGateways[$gateway];
        }

        if (! isset($this->gateways[$gateway])) {
            throw new InvalidArgumentException("Gateway [{$gateway}] is not registered.");
        }

        $resolver = $this->gateways[$gateway];

        $instance = $resolver instanceof Closure
            ? $resolver($this->app)
            : $this->app->make($resolver);

        return $this->resolvedGateways[$gateway] = $instance;
    }

    /**
     * Alias for driver(null) - get the default gateway.
     */
    public function default(): GatewayManagerInterface
    {
        return $this->driver();
    }

    /**
     * Register a new gateway driver.
     *
     * @param  class-string<GatewayManagerInterface>|Closure  $resolver
     */
    public function extend(string $name, string|Closure $resolver): self
    {
        $this->gateways[$name] = $resolver;

        // Clear resolved instance if re-registering
        unset($this->resolvedGateways[$name]);

        return $this;
    }

    /**
     * Get all available gateway names.
     *
     * @return string[]
     */
    public function getAvailableGateways(): array
    {
        return array_keys($this->gateways);
    }

    /**
     * Get status of all gateways.
     *
     * @return array<string, bool>
     */
    public function getGatewaysStatus(): array
    {
        $status = [];

        foreach ($this->getAvailableGateways() as $gateway) {
            try {
                $instance = $this->driver($gateway);
                $status[$gateway] = $instance->isAvailable();
            } catch (\Throwable) {
                $status[$gateway] = false;
            }
        }

        return $status;
    }

    /**
     * Check if a gateway is registered.
     */
    public function hasGateway(string $gateway): bool
    {
        return isset($this->gateways[$gateway]);
    }

    /**
     * Get the default gateway name from config.
     */
    public function getDefaultGateway(): string
    {
        return config('payments.default', config('payments.gateway', 'asaas'));
    }

    /**
     * Clear all resolved gateway instances.
     * Useful for testing or when configuration changes.
     */
    public function forgetResolvedInstances(): void
    {
        $this->resolvedGateways = [];
    }

    /**
     * Register the default gateways.
     */
    protected function registerDefaultGateways(): void
    {
        $this->gateways = [
            'asaas' => AsaasManager::class,
            #'iugu' => IuguManager::class,
        ];
    }
}
