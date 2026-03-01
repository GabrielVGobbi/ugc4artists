<?php

namespace App\Providers;

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
use Illuminate\Support\ServiceProvider;

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
}
