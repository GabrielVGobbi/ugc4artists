<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Events\Account\ServicePaid;
use App\Events\Campaign\CampaignCheckoutCompleted;
use App\Listeners\Account\LogAccountStatement;
use App\Listeners\Account\LogWalletDeposit;
use App\Listeners\Account\UpdateAccountStatementStatus;
use App\Listeners\Campaign\LogCampaignTransaction;
use App\Listeners\Campaign\UpdateCampaignTransactionStatus;
use App\Modules\Payments\Events\PaymentFailed;
use App\Modules\Payments\Events\PaymentPaid;
use App\Modules\Payments\Events\PaymentRefunded;
use Illuminate\Support\Facades\Event;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->registerCampaignEvents();
        $this->registerAccountEvents();
    }

    private function registerCampaignEvents()
    {
        Event::listen(
            CampaignCheckoutCompleted::class,
            LogCampaignTransaction::class
        );

        Event::listen(
            PaymentPaid::class,
            [UpdateCampaignTransactionStatus::class, 'handlePaid']
        );

        Event::listen(
            PaymentPaid::class,
            [UpdateCampaignTransactionStatus::class, 'handlePaid']
        );

        Event::listen(
            PaymentFailed::class,
            [UpdateCampaignTransactionStatus::class, 'handleFailed']
        );
    }

    private function registerAccountEvents()
    {
        // Log service payments to AccountStatement (unified bank statement)
        Event::listen(
            ServicePaid::class,
            LogAccountStatement::class
        );

        // Log wallet deposits to AccountStatement
        Event::listen(
            PaymentPaid::class,
            LogWalletDeposit::class
        );

        // Update AccountStatement status when payment status changes
        Event::listen(
            PaymentPaid::class,
            [UpdateAccountStatementStatus::class, 'handlePaid']
        );

        Event::listen(
            PaymentFailed::class,
            [UpdateAccountStatementStatus::class, 'handleFailed']
        );

        Event::listen(
            PaymentRefunded::class,
            [UpdateAccountStatementStatus::class, 'handleRefunded']
        );
    }

    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(
            fn(): ?Password => app()->isProduction()
                ? Password::min(6)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
                : null
        );

        Model::preventLazyLoading(!app()->isProduction());
    }
}
