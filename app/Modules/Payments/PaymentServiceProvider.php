<?php

declare(strict_types=1);

namespace App\Modules\Payments;

use App\Modules\Payments\Checkout\CheckoutBuilder;
use App\Modules\Payments\Core\Contracts\GatewayManagerInterface;
use App\Modules\Payments\Gateways\Asaas\AsaasConfiguration;
use App\Modules\Payments\Gateways\Asaas\AsaasManager;
use App\Modules\Payments\Gateways\Iugu\IuguConfiguration;
use App\Modules\Payments\Gateways\Iugu\IuguManager;
use App\Modules\Payments\Services\CheckoutService;
use App\Modules\Payments\Services\RefundService;
use App\Modules\Payments\Services\SettlementService;
use App\Modules\Payments\Gateways\Asaas\Webhooks\AsaasWebhookHandler;
use App\Modules\Payments\Webhooks\WebhookDispatcher;
use App\Modules\Payments\Console\Commands\InstallPaymentsCommand;
use App\Modules\Payments\Console\Commands\PaymentsStatusCommand;
use App\Modules\Payments\Console\Commands\SetupAsaasWebhookCommand;
use Illuminate\Support\ServiceProvider;

/**
 * Service provider for the Payments module.
 * Registers all payment-related services, gateways, and facades.
 */
class PaymentServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->registerConfigurations();
        $this->registerGatewayManagers();
        $this->registerRegistry();
        $this->registerServices();
        $this->registerWebhooks();
        $this->registerLegacyBindings();
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //Migrations
        $this->loadMigrationsFrom(__DIR__ . '/Database/Migrations');

        // Publish config if needed
        if ($this->app->runningInConsole()) {
            $this->publishes([
                __DIR__ . '/Database/Migrations' => database_path('migrations'),
                __DIR__ . '/../../config/payments.php' => config_path('payments.php'),
            ], 'payments');

            $this->commands([
                InstallPaymentsCommand::class,
                PaymentsStatusCommand::class,
                SetupAsaasWebhookCommand::class,
            ]);
        }

        // Validate configuration in development
        if (config('app.debug') && ! $this->app->runningInConsole()) {
            $this->validateConfiguration();
        }
    }

    /**
     * Validate the payments configuration.
     * Only runs in debug mode to help developers identify issues.
     */
    protected function validateConfiguration(): void
    {
        $defaultGateway = config('payments.default');

        if (empty($defaultGateway)) {
            logger()->warning('Payments module: No default gateway configured');

            return;
        }

        $gatewayConfig = config("payments.gateways.{$defaultGateway}");

        if (empty($gatewayConfig)) {
            logger()->warning("Payments module: Gateway '{$defaultGateway}' not found in configuration");

            return;
        }

        if (empty($gatewayConfig['api_key'])) {
            logger()->warning("Payments module: No API key configured for gateway '{$defaultGateway}'");
        }
    }

    /**
     * Register gateway configurations.
     */
    protected function registerConfigurations(): void
    {
        $this->app->singleton(AsaasConfiguration::class);
        #$this->app->singleton(IuguConfiguration::class);
    }

    /**
     * Register gateway managers.
     */
    protected function registerGatewayManagers(): void
    {
        // Asaas Manager
        $this->app->singleton(AsaasManager::class, function ($app) {
            return new AsaasManager($app->make(AsaasConfiguration::class));
        });

        // Iugu Manager
        #$this->app->singleton(IuguManager::class, function ($app) {
        #    return new IuguManager($app->make(IuguConfiguration::class));
        #});
    }

    /**
     * Register the gateway registry.
     */
    protected function registerRegistry(): void
    {
        $this->app->singleton(GatewayRegistry::class);

        // Bind default gateway interface to registry
        $this->app->bind(GatewayManagerInterface::class, function ($app) {
            return $app->make(GatewayRegistry::class)->default();
        });
    }

    /**
     * Register services.
     */
    protected function registerServices(): void
    {
        // Settlement service
        $this->app->singleton(SettlementService::class);

        // Refund service
        $this->app->singleton(RefundService::class, function ($app) {
            return new RefundService($app->make(GatewayManager::class));
        });

        // Checkout service (legacy)
        $this->app->singleton(CheckoutService::class, function ($app) {
            return new CheckoutService($app->make(GatewayManager::class));
        });

        // Checkout builder (new fluent API)
        $this->app->bind(CheckoutBuilder::class, function ($app) {
            return new CheckoutBuilder(
                $app->make(GatewayRegistry::class),
                $app->make(SettlementService::class),
            );
        });
    }

    /**
     * Register webhook dispatcher and handlers.
     */
    protected function registerWebhooks(): void
    {
        // Register Asaas webhook handler
        $this->app->singleton(AsaasWebhookHandler::class, function ($app) {
            return new AsaasWebhookHandler(
                $app->make(SettlementService::class),
            );
        });

        // Register the webhook dispatcher
        $this->app->singleton(WebhookDispatcher::class, function ($app) {
            $dispatcher = new WebhookDispatcher();

            // Register Asaas handler
            if (config('payments.gateways.asaas.enabled', true)) {
                $dispatcher->registerHandler('asaas', $app->make(AsaasWebhookHandler::class));
            }

            // Register Iugu handler when implemented
            // if (config('payments.gateways.iugu.enabled', false)) {
            //     $dispatcher->registerHandler('iugu', $app->make(IuguWebhookHandler::class));
            // }

            return $dispatcher;
        });
    }

    /**
     * Register legacy bindings for backward compatibility.
     */
    protected function registerLegacyBindings(): void
    {
        // Legacy GatewayManager (for backward compatibility)
        $this->app->singleton(GatewayManager::class);

        // Legacy interface binding
        $this->app->bind(Contracts\PaymentGatewayInterface::class, function ($app) {
            return $app->make(GatewayManager::class)->driver();
        });
    }

    /**
     * Get the services provided by the provider.
     *
     * @return array<string>
     */
    public function provides(): array
    {
        return [
            AsaasConfiguration::class,
            AsaasManager::class,
            #IuguConfiguration::class,
            #IuguManager::class,
            GatewayRegistry::class,
            GatewayManagerInterface::class,
            GatewayManager::class,
            SettlementService::class,
            RefundService::class,
            CheckoutService::class,
            CheckoutBuilder::class,
            WebhookDispatcher::class,
        ];
    }
}
